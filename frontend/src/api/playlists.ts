import { API_BASE_URL } from './config';
import type { Song } from '../types/song';

export interface Playlist {
  id?: string;
  tagId: string;
  songIds: string[];
}

export interface PlaylistData {
  playlist: Playlist | null;
  songs: Song[];
}

export async function fetchPlaylist(tagId: string, token: string): Promise<PlaylistData> {
  const res = await fetch(`${API_BASE_URL}/api/playlists/${tagId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Erreur lors du chargement de la playlist');

  return (await res.json()) as PlaylistData;
}

export async function addSongToPlaylist(tagId: string, songId: string, token: string): Promise<Playlist> {
  const res = await fetch(`${API_BASE_URL}/api/playlists/${tagId}/songs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ songId }),
  });

  if (!res.ok) {
    const body = await res.json() as { message?: string };
    throw new Error(body.message ?? 'Erreur lors de l\'ajout de la chanson à la playlist');
  }

  return (await res.json()) as Playlist;
}

export async function removeSongFromPlaylist(tagId: string, songId: string, token: string): Promise<Playlist> {
  const res = await fetch(`${API_BASE_URL}/api/playlists/${tagId}/songs/${songId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.json() as { message?: string };
    throw new Error(body.message ?? 'Erreur lors du retrait de la chanson de la playlist');
  }

  return (await res.json()) as Playlist;
}

export async function reorderPlaylist(tagId: string, songIds: string[], token: string): Promise<Playlist> {
  const res = await fetch(`${API_BASE_URL}/api/playlists/${tagId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ songIds }),
  });

  if (!res.ok) {
    const body = await res.json() as { message?: string };
    throw new Error(body.message ?? 'Erreur lors de la sauvegarde de la playlist');
  }

  return (await res.json()) as Playlist;
}
