import { useEffect, useRef, useCallback } from 'react';

// Ensure the IFrame API script is loaded only once
let apiLoaded = false;
let apiReady = false;
const readyCallbacks: (() => void)[] = [];

function ensureApi(): Promise<void> {
  if (apiReady) return Promise.resolve();
  return new Promise<void>((resolve) => {
    readyCallbacks.push(resolve);
    if (!apiLoaded) {
      apiLoaded = true;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);

      (window as unknown as Record<string, unknown>).onYouTubeIframeAPIReady = () => {
        apiReady = true;
        readyCallbacks.forEach((cb) => cb());
        readyCallbacks.length = 0;
      };
    }
  });
}

interface UseYouTubePlayerOptions {
  videoId: string;
  onEnded?: () => void;
  onReady?: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export function useYouTubePlayer({
  videoId,
  onEnded,
  onReady,
  onPlayStateChange,
}: UseYouTubePlayerOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const onEndedRef = useRef(onEnded);
  const onReadyRef = useRef(onReady);
  const onPlayStateChangeRef = useRef(onPlayStateChange);

  // Keep refs current
  onEndedRef.current = onEnded;
  onReadyRef.current = onReady;
  onPlayStateChangeRef.current = onPlayStateChange;

  // Create the player once
  useEffect(() => {
    let destroyed = false;

    ensureApi().then(() => {
      if (destroyed || !containerRef.current) return;

      const el = document.createElement('div');
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(el);

      playerRef.current = new YT.Player(el, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => onReadyRef.current?.(),
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === YT.PlayerState.ENDED) {
              onEndedRef.current?.();
            }
            if (event.data === YT.PlayerState.PLAYING) {
              onPlayStateChangeRef.current?.(true);
            } else if (
              event.data === YT.PlayerState.PAUSED ||
              event.data === YT.PlayerState.ENDED
            ) {
              onPlayStateChangeRef.current?.(false);
            }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load new video when videoId changes
  const loadVideo = useCallback((id: string) => {
    if (playerRef.current) {
      playerRef.current.loadVideoById(id);
    }
  }, []);

  useEffect(() => {
    if (videoId) {
      loadVideo(videoId);
    }
  }, [videoId, loadVideo]);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const togglePlay = useCallback(() => {
    const state = playerRef.current?.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.playVideo();
    }
  }, []);

  return { containerRef, playerRef, play, pause, togglePlay };
}
