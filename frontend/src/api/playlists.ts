import { API_BASE_URL } from './config';
import { handleApiResponseError } from '../utils/apiErrorHandling';
import type { Song } from '../types/song';

export interface Playlist {
  id?: string;
  name: string;
  songIds: string[];
}

export interface PlaylistData {
  playlist: Playlist | null;
  songs: Song[];
}

export async function fetchPlaylists(token: string): Promise<Playlist[]> {
  const res = await fetch(`${API_BASE_URL}/api/playlists`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Erreur lors du chargement des playlists');

  return (await res.json()) as Playlist[];
}

export async function fetchPlaylistsPublic(): Promise<Playlist[]> {
  const res = await fetch(`${API_BASE_URL}/api/playlists`);

  if (!res.ok) throw new Error('Erreur lors du chargement des playlists');

  return (await res.json()) as Playlist[];
}

export async function fetchPlaylistPublic(playlistName: string): Promise<PlaylistData> {
  const res = await fetch(`${API_BASE_URL}/api/playlists/${encodeURIComponent(playlistName)}`);

  if (!res.ok) throw new Error('Erreur lors du chargement de la playlist');

  return (await res.json()) as PlaylistData;
}

export async function createPlaylist(name: string, token: string): Promise<Playlist> {
  const res = await fetch(`${API_BASE_URL}/api/playlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    await handleApiResponseError(res, 'Erreur lors de la création de la playlist');
  }

  return (await res.json()) as Playlist;
}

export async function renamePlaylist(playlistName: string, newName: string, token: string): Promise<Playlist> {
  const res = await fetch(`${API_BASE_URL}/api/playlists/${encodeURIComponent(playlistName)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newName }),
  });

  if (!res.ok) {
    await handleApiResponseError(res, 'Erreur lors du renommage de la playlist');
  }

  return (await res.json()) as Playlist;
}

export async function deletePlaylist(playlistName: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/playlists/${encodeURIComponent(playlistName)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    await handleApiResponseError(res, 'Erreur lors de la suppression de la playlist');
  }
}

export async function fetchPlaylist(playlistName: string, token: string): Promise<PlaylistData> {
  const res = await fetch(`${API_BASE_URL}/api/playlists/${encodeURIComponent(playlistName)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Erreur lors du chargement de la playlist');

  return (await res.json()) as PlaylistData;
}

export async function addSongToPlaylist(playlistName: string, songId: string, token: string): Promise<Playlist> {
  const res = await fetch(`${API_BASE_URL}/api/playlists/${encodeURIComponent(playlistName)}/songs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ songId }),
  });

  if (!res.ok) {
    await handleApiResponseError(res, 'Erreur lors de l\'ajout de la chanson à la playlist');
  }

  return (await res.json()) as Playlist;
}

export async function removeSongFromPlaylist(playlistName: string, songId: string, token: string): Promise<Playlist> {
  const res = await fetch(`${API_BASE_URL}/api/playlists/${encodeURIComponent(playlistName)}/songs/${songId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await handleApiResponseError(res, 'Erreur lors du retrait de la chanson de la playlist');
  }

  return (await res.json()) as Playlist;
}

export async function reorderPlaylist(playlistName: string, songIds: string[], token: string): Promise<Playlist> {
  const res = await fetch(`${API_BASE_URL}/api/playlists/${encodeURIComponent(playlistName)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ songIds }),
  });

  if (!res.ok) {
    await handleApiResponseError(res, 'Erreur lors de la sauvegarde de la playlist');
  }

  return (await res.json()) as Playlist;
}
