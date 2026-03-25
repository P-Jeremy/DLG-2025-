import type { Song, SortField } from '../types/song';
import { API_BASE_URL } from './config';

export async function fetchSongs(sortBy: SortField): Promise<Song[]> {
  const res = await fetch(`${API_BASE_URL}/api/songs?sortBy=${sortBy}`);
  if (!res.ok) throw new Error('Erreur lors du chargement des chansons');
  const data = await res.json() as unknown;

  if (!Array.isArray(data)) throw new Error('Format incorrect');

  return data as Song[];
}

export async function fetchSongsByTag(tagId: string): Promise<Song[]> {
  const res = await fetch(`${API_BASE_URL}/api/songs?tagId=${tagId}`);
  if (!res.ok) throw new Error('Erreur lors du chargement des chansons');
  const data = await res.json() as unknown;

  if (!Array.isArray(data)) throw new Error('Format incorrect');

  return data as Song[];
}

export interface AddSongPayload {
  title: string;
  author: string;
  lyrics: string;
  tab: File;
  selectedTags: string[];
}

export async function addSong(payload: AddSongPayload, token: string): Promise<Song> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('author', payload.author);
  formData.append('lyrics', payload.lyrics);
  formData.append('tab', payload.tab);
  formData.append('selectedTags', JSON.stringify(payload.selectedTags));

  const res = await fetch(`${API_BASE_URL}/api/songs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json() as { message?: string };
    throw new Error(body.message ?? 'Erreur lors de l\'ajout de la chanson');
  }

  return (await res.json()) as Song;
}
