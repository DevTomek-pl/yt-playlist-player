import './Controls.css';

export type LoopMode = 'none' | 'all' | 'one';

interface ControlsProps {
  isPlaying: boolean;
  shuffle: boolean;
  loop: LoopMode;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onCycleLoop: () => void;
}

export default function Controls({
  isPlaying,
  shuffle,
  loop,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleShuffle,
  onCycleLoop,
}: ControlsProps) {
  const loopLabel =
    loop === 'none' ? 'Loop off' : loop === 'all' ? 'Loop all' : 'Loop one';

  return (
    <div className="controls">
      {/* Shuffle */}
      <button
        className={`ctrl-btn ${shuffle ? 'active' : ''}`}
        onClick={onToggleShuffle}
        title={shuffle ? 'Shuffle on' : 'Shuffle off'}
        aria-label="Shuffle"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
        </svg>
      </button>

      {/* Previous */}
      <button className="ctrl-btn" onClick={onPrev} title="Previous" aria-label="Previous">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* Play / Pause */}
      <button
        className="ctrl-btn ctrl-play"
        onClick={onTogglePlay}
        title={isPlaying ? 'Pause' : 'Play'}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Next */}
      <button className="ctrl-btn" onClick={onNext} title="Next" aria-label="Next">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>

      {/* Loop */}
      <button
        className={`ctrl-btn ${loop !== 'none' ? 'active' : ''}`}
        onClick={onCycleLoop}
        title={loopLabel}
        aria-label={loopLabel}
      >
        {loop === 'one' ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            <text x="12" y="15.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor">1</text>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
          </svg>
        )}
      </button>
    </div>
  );
}

