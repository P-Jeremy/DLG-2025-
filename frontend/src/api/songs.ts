import type { Song } from '../types/song';
import { API_BASE_URL } from './config';
import { handleApiResponseError } from '../utils/apiErrorHandling';

export async function fetchSongs(options?: { force?: boolean }): Promise<Song[]> {
  const base = `${API_BASE_URL}/api/songs?sortBy=title`;
  const url = options?.force ? `${base}&_t=${Date.now()}` : base;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur lors du chargement des chansons');
  const parsedResponse = await res.json() as unknown;

  if (!Array.isArray(parsedResponse)) throw new Error('Format incorrect');

  return parsedResponse as Song[];
}

export interface AddSongPayload {
  title: string;
  author: string;
  lyrics: string;
  tab: File;
}

export async function deleteSong(songId: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/songs/${songId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    await handleApiResponseError(res, 'Erreur lors de la suppression de la chanson');
  }
}

export interface UpdateSongPayload {
  title: string;
  author: string;
  lyrics: string;
  tab?: File;
}

export async function updateSong(songId: string, payload: UpdateSongPayload, token: string): Promise<Song> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('author', payload.author);
  formData.append('lyrics', payload.lyrics);
  if (payload.tab) {
    formData.append('tab', payload.tab);
  }

  const res = await fetch(`${API_BASE_URL}/api/songs/${songId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    await handleApiResponseError(res, 'Erreur lors de la modification de la chanson');
  }

  return (await res.json()) as Song;
}

export async function addSong(payload: AddSongPayload, token: string): Promise<Song> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('author', payload.author);
  formData.append('lyrics', payload.lyrics);
  formData.append('tab', payload.tab);

  const res = await fetch(`${API_BASE_URL}/api/songs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    await handleApiResponseError(res, 'Erreur lors de l\'ajout de la chanson');
  }

  return (await res.json()) as Song;
}
