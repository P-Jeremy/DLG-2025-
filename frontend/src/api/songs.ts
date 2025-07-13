import type { Song } from '../components/SongList';

export async function fetchSongs(): Promise<Song[]> {
  const res = await fetch('/api/songs');
  if (!res.ok) throw new Error('Erreur lors du chargement des chansons');
  const data = await res.json() as unknown;
  
  if (!Array.isArray(data)) throw new Error('Format incorrect');
  
  return data as Song[];
}
