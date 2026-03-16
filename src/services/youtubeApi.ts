import type { PlaylistItem } from '../types';

// Public Invidious instance – no API key required.
// If this instance goes down, replace with another from https://docs.invidious.io/instances/
const INVIDIOUS_INSTANCE = 'https://inv.nadeko.net';

// Videos returned per page by Invidious
const VIDEOS_PER_PAGE = 100;

export interface FetchProgress {
  loaded: number;
  total: number;
}

interface InvidiousThumbnail {
  quality: string;
  url: string;
  width?: number;
  height?: number;
}

interface InvidiousVideo {
  videoId: string;
  title: string;
  author: string;
  videoThumbnails: InvidiousThumbnail[];
}

interface InvidiousPlaylistResponse {
  videoCount: number;
  videos: InvidiousVideo[];
  error?: string;
}

function pickThumbnail(thumbs: InvidiousThumbnail[], instanceBase: string): string {
  const preferred = ['medium', 'high', 'sddefault', 'default', 'maxresdefault'];
  for (const quality of preferred) {
    const t = thumbs.find((t) => t.quality === quality);
    if (t?.url) {
      return t.url.startsWith('http') ? t.url : `${instanceBase}${t.url}`;
    }
  }
  const first = thumbs[0];
  if (!first?.url) return '';
  return first.url.startsWith('http') ? first.url : `${instanceBase}${first.url}`;
}

export async function fetchPlaylistItems(
  playlistId: string,
  onProgress?: (progress: FetchProgress) => void
): Promise<PlaylistItem[]> {
  const items: PlaylistItem[] = [];
  let page = 1;
  let totalResults = 0;
  let fetched = 0;

  while (true) {
    const url = `${INVIDIOUS_INSTANCE}/api/v1/playlists/${encodeURIComponent(playlistId)}?page=${page}`;
    const response = await fetch(url);

    if (!response.ok) {
      let message = `Invidious API error: ${response.status}`;
      try {
        const err: InvidiousPlaylistResponse = await response.json();
        if (err.error) message = err.error;
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(message);
    }

    const data: InvidiousPlaylistResponse = await response.json();

    if (page === 1) {
      totalResults = data.videoCount ?? 0;
    }

    const videos = data.videos ?? [];
    if (videos.length === 0) break;

    for (const video of videos) {
      fetched++;
      items.push({
        videoId: video.videoId,
        title: video.title,
        thumbnail: pickThumbnail(video.videoThumbnails ?? [], INVIDIOUS_INSTANCE),
        channelTitle: video.author ?? '',
      });
    }

    if (onProgress && totalResults > 0) {
      onProgress({ loaded: fetched, total: totalResults });
    }

    if (fetched >= totalResults || videos.length < VIDEOS_PER_PAGE) break;
    page++;
  }

  return items;
}

