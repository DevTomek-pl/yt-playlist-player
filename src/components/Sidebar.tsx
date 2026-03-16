import { useEffect, useRef } from 'react';
import type { PlaylistItem } from '../types';
import './Sidebar.css';

interface SidebarProps {
  items: PlaylistItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export default function Sidebar({ items, currentIndex, onSelect }: SidebarProps) {
  const activeRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentIndex]);

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">
        Playlist <span className="sidebar-count">{items.length} videos</span>
      </h2>
      <ul className="sidebar-list">
        {items.map((item, index) => (
          <li
            key={item.videoId}
            ref={index === currentIndex ? activeRef : null}
            className={`sidebar-item ${index === currentIndex ? 'active' : ''}`}
            onClick={() => onSelect(index)}
          >
            <span className="sidebar-index">{index + 1}</span>
            <img
              className="sidebar-thumb"
              src={item.thumbnail}
              alt={item.title}
              loading="lazy"
            />
            <div className="sidebar-info">
              <p className="sidebar-video-title">{item.title}</p>
              <p className="sidebar-channel">{item.channelTitle}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

