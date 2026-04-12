import { API_BASE_URL } from './config';

export interface Meta {
  updatedAt: string;
}

export async function fetchMeta(): Promise<Meta> {
  const res = await fetch(`${API_BASE_URL}/api/meta`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch meta');
  return (await res.json()) as Meta;
}
