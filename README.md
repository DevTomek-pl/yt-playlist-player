# YT Playlist Player

A React + TypeScript web application that loads and plays videos from a YouTube playlist — **no API key required**.

## Features

- 🎬 Loads all videos from a YouTube playlist via the [Invidious API](https://docs.invidious.io/) (no API key needed)
- ⏭️ Auto-advances to the next video when the current one ends
- 🔀 Shuffle mode — randomises playback order on the fly
- 🔁 Loop modes — loop all, loop one, or no loop
- 📋 Sidebar playlist with thumbnails, titles, and "now playing" indicator
- 🎨 Dark theme inspired by YouTube
- 📱 Responsive layout (side-by-side on desktop, stacked on mobile)
- ⌨️ Keyboard shortcuts for fast control
- 🎛️ Media Session API support (OS-level media keys & lock-screen metadata)

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173/yt-playlist-player/](http://localhost:5173/yt-playlist-player/), enter a YouTube playlist ID, and the default playlist (`PL8A2F4D823A7D2E49`) will load automatically.

### Build

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` / `k` | Play / Pause |
| `ArrowRight` / `n` | Next video |
| `ArrowLeft` / `p` | Previous video |
| `s` | Toggle shuffle |
| `l` | Cycle loop mode |

## How It Works

1. On launch, the app displays a setup form — enter any public YouTube playlist ID
2. Playlist metadata is fetched from a public [Invidious](https://docs.invidious.io/) instance (no API key required, handles pagination)
3. Videos are played using the YouTube IFrame Player API
4. A sidebar shows all playlist items with thumbnails — click any to jump to it
5. When a video ends, the next one auto-plays according to the current loop and shuffle settings

## Tech Stack

- **React 19** with TypeScript
- **Vite** for bundling and dev server
- **YouTube IFrame Player API** for video playback
- **Invidious API** for playlist metadata (no API key required)
- **GitHub Pages** for deployment

