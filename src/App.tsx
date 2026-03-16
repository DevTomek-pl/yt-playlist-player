import { useState, useCallback, useEffect, useRef, type FormEvent } from 'react';
import type { PlaylistItem } from './types';
import { fetchPlaylistItems, type FetchProgress } from './services/youtubeApi';
import Player, { type PlayerHandle } from './components/Player';
import Sidebar from './components/Sidebar';
import Controls, { type LoopMode } from './components/Controls';
import './App.css';

const DEFAULT_PLAYLIST_ID = 'PL8A2F4D823A7D2E49';

/** Fisher-Yates shuffle (returns new array) */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('yt-api-key') ?? '');
  const [playlistId, setPlaylistId] = useState(DEFAULT_PLAYLIST_ID);
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<FetchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [loop, setLoop] = useState<LoopMode>('all');

  const playerRef = useRef<PlayerHandle>(null);

  // ── Playlist navigation ──

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (shuffle) {
        let next: number;
        do {
          next = Math.floor(Math.random() * items.length);
        } while (next === prev && items.length > 1);
        return next;
      }
      if (prev < items.length - 1) return prev + 1;
      return loop !== 'none' ? 0 : prev; // wrap if loop, stay if no loop
    });
  }, [items.length, shuffle, loop]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev > 0) return prev - 1;
      return loop !== 'none' ? items.length - 1 : 0;
    });
  }, [items.length, loop]);

  const handleVideoEnd = useCallback(() => {
    if (loop === 'one') {
      // Replay the same video
      playerRef.current?.play();
      return;
    }
    if (loop === 'none' && !shuffle && currentIndex === items.length - 1) {
      // Last track, no loop — stop
      return;
    }
    goToNext();
  }, [loop, shuffle, currentIndex, items.length, goToNext]);

  const handleSelect = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleTogglePlay = useCallback(() => {
    playerRef.current?.togglePlay();
  }, []);

  const handleToggleShuffle = useCallback(() => {
    setShuffle((s) => !s);
  }, []);

  const handleCycleLoop = useCallback(() => {
    setLoop((l) => (l === 'none' ? 'all' : l === 'all' ? 'one' : 'none'));
  }, []);

  // ── Shuffle playlist order ──
  const handleShufflePlaylist = useCallback(() => {
    if (items.length === 0) return;
    const currentVideo = items[currentIndex];
    const shuffled = shuffleArray(items);
    // Keep current video at index 0
    const idx = shuffled.findIndex((i) => i.videoId === currentVideo.videoId);
    if (idx > 0) {
      [shuffled[0], shuffled[idx]] = [shuffled[idx], shuffled[0]];
    }
    setItems(shuffled);
    setCurrentIndex(0);
  }, [items, currentIndex]);

  // When shuffle is toggled on, reshuffle the list
  useEffect(() => {
    if (shuffle && started) {
      handleShufflePlaylist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffle]);

  // ── Media Session API (media keys) ──
  useEffect(() => {
    if (!started || !('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => playerRef.current?.play());
    navigator.mediaSession.setActionHandler('pause', () => playerRef.current?.pause());
    navigator.mediaSession.setActionHandler('previoustrack', goToPrev);
    navigator.mediaSession.setActionHandler('nexttrack', goToNext);

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    };
  }, [started, goToNext, goToPrev]);

  // Update Media Session metadata
  useEffect(() => {
    if (!started || !('mediaSession' in navigator) || items.length === 0) return;
    const current = items[currentIndex];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.channelTitle,
      artwork: current.thumbnail
        ? [{ src: current.thumbnail, sizes: '320x180', type: 'image/jpeg' }]
        : [],
    });
  }, [started, items, currentIndex]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    if (!started) return;

    const handler = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'ArrowRight':
        case 'n':
          e.preventDefault();
          goToNext();
          break;
        case 'ArrowLeft':
        case 'p':
          e.preventDefault();
          goToPrev();
          break;
        case 's':
          e.preventDefault();
          handleToggleShuffle();
          break;
        case 'l':
          e.preventDefault();
          handleCycleLoop();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [started, handleTogglePlay, goToNext, goToPrev, handleToggleShuffle, handleCycleLoop]);

  // ── Setup form ──
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setError(null);
    setProgress(null);

    try {
      localStorage.setItem('yt-api-key', apiKey.trim());
      const fetched = await fetchPlaylistItems(apiKey.trim(), playlistId, setProgress);
      if (fetched.length === 0) {
        setError('Playlist is empty or not found.');
        return;
      }
      setItems(fetched);
      setCurrentIndex(0);
      setStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch playlist.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStarted(false);
    setItems([]);
    setCurrentIndex(0);
    setError(null);
    setIsPlaying(false);
    setShuffle(false);
    setLoop('all');
  };

  if (!started) {
    return (
      <div className="setup-screen">
        <div className="setup-card">
          <h1 className="setup-title">
            <span className="logo">▶</span> YT Playlist Player
          </h1>
          <p className="setup-desc">
            Enter your YouTube Data API v3 key to load a playlist.
          </p>
          <form onSubmit={handleSubmit} className="setup-form">
            <label className="setup-label">
              API Key
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="setup-input"
                required
              />
            </label>
            <label className="setup-label">
              Playlist ID
              <input
                type="text"
                value={playlistId}
                onChange={(e) => setPlaylistId(e.target.value)}
                placeholder="PL8A2F4D823A7D2E49"
                className="setup-input"
                required
              />
            </label>
            <button type="submit" className="setup-btn" disabled={loading}>
              {loading ? 'Loading…' : 'Load Playlist'}
            </button>
            {loading && progress && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.round((progress.loaded / progress.total) * 100)}%` }}
                  />
                </div>
                <span className="progress-text">
                  {progress.loaded} / {progress.total} videos ({Math.round((progress.loaded / progress.total) * 100)}%)
                </span>
              </div>
            )}
          </form>
          {error && <p className="setup-error">{error}</p>}
        </div>
      </div>
    );
  }

  const currentVideo = items[currentIndex];

  return (
    <div className="app-layout">
      <div className="main-panel">
        <header className="top-bar">
          <h1 className="top-title">
            <span className="logo">▶</span> YT Player
          </h1>
          <button className="reset-btn" onClick={handleReset}>
            Change Playlist
          </button>
        </header>
        <Player
          ref={playerRef}
          videoId={currentVideo.videoId}
          onEnded={handleVideoEnd}
          onPlayStateChange={setIsPlaying}
        />
        <Controls
          isPlaying={isPlaying}
          shuffle={shuffle}
          loop={loop}
          onTogglePlay={handleTogglePlay}
          onNext={goToNext}
          onPrev={goToPrev}
          onToggleShuffle={handleToggleShuffle}
          onCycleLoop={handleCycleLoop}
        />
        <div className="now-playing">
          <h2 className="now-playing-title">{currentVideo.title}</h2>
          <p className="now-playing-channel">{currentVideo.channelTitle}</p>
        </div>
      </div>
      <Sidebar items={items} currentIndex={currentIndex} onSelect={handleSelect} />
    </div>
  );
}

export default App;
