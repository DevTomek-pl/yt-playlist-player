# YT Playlist Player

A React + TypeScript web application that loads and plays videos from a YouTube playlist.

## Features

- 🎬 Loads all videos from a YouTube playlist using YouTube Data API v3
- advancement Auto-advances to next video when current one ends (loops back to start)
- 📋 Sidebar playlist with thumbnails, titles, and "now playing" indicator
- 🎨 Dark theme inspired by YouTube
- 📱 Responsive layout (side-by-side on desktop, stacked on mobile)
- 💾 API key persisted in localStorage

## Getting Started

### Prerequisites

- Node.js 18+
- A [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com) key

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), enter your YouTube API key, and the default playlist (`PL8A2F4D823A7D2E49`) will load automatically.

### Build

```bash
npm run build
```

## How It Works

1. On launch, the app displays a setup form for your YouTube API key and playlist ID
2. The app fetches all playlist items via the YouTube Data API v3 (handles pagination)
3. Videos are played using the YouTube IFrame Player API
4. A sidebar shows all playlist items with thumbnails — click any to jump to it
5. When a video ends, the next one auto-plays

## Tech Stack

- **React 19** with TypeScript
- **Vite** for bundling and dev server
- **YouTube IFrame Player API** for video playback
- **YouTube Data API v3** for playlist metadata

