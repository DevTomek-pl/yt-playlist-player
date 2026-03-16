import { useImperativeHandle, forwardRef } from 'react';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import './Player.css';

interface PlayerProps {
  videoId: string;
  onEnded: () => void;
  onPlayStateChange: (isPlaying: boolean) => void;
}

export interface PlayerHandle {
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
}

const Player = forwardRef<PlayerHandle, PlayerProps>(
  ({ videoId, onEnded, onPlayStateChange }, ref) => {
    const { containerRef, togglePlay, play, pause } = useYouTubePlayer({
      videoId,
      onEnded,
      onPlayStateChange,
    });

    useImperativeHandle(ref, () => ({ togglePlay, play, pause }), [
      togglePlay,
      play,
      pause,
    ]);

    return (
      <div className="player-wrapper">
        <div className="player-container" ref={containerRef} />
      </div>
    );
  }
);

Player.displayName = 'Player';
export default Player;
