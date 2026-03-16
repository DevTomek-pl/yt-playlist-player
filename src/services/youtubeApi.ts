import type { PlaylistItem } from '../types';

const API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface FetchProgress {
  loaded: number;
  total: number;
}

export async function fetchPlaylistItems(
  apiKey: string,
  playlistId: string,
  onProgress?: (progress: FetchProgress) => void
): Promise<PlaylistItem[]> {
  const items: PlaylistItem[] = [];
  let nextPageToken: string | undefined;
  let totalResults = 0;
  let fetchedFromApi = 0;

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId,
      maxResults: '50',
      key: apiKey,
    });
    if (nextPageToken) {
      params.set('pageToken', nextPageToken);
    }

    const response = await fetch(`${API_BASE}/playlistItems?${params}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error?.message ?? `YouTube API error: ${response.status}`
      );
    }

    const data = await response.json();

    if (data.pageInfo?.totalResults) {
      totalResults = data.pageInfo.totalResults;
    }

    for (const item of data.items ?? []) {
      fetchedFromApi++;
      const snippet = item.snippet;
      // Skip deleted / private videos
      if (snippet.title === 'Deleted video' || snippet.title === 'Private video') {
        continue;
      }
      items.push({
        videoId: snippet.resourceId.videoId,
        title: snippet.title,
        thumbnail:
          snippet.thumbnails?.medium?.url ??
          snippet.thumbnails?.default?.url ??
          '',
        channelTitle: snippet.channelTitle ?? '',
      });
    }

    nextPageToken = data.nextPageToken;

    if (onProgress && totalResults > 0) {
      onProgress({ loaded: fetchedFromApi, total: totalResults });
    }
  } while (nextPageToken);

  return items;
}

