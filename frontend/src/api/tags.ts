import { API_BASE_URL } from './config';

export interface Tag {
  id: string;
  name: string;
}

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch(`${API_BASE_URL}/api/tags`);
  if (!res.ok) throw new Error('Erreur lors du chargement des tags');
  const data = await res.json() as unknown;

  if (!Array.isArray(data)) throw new Error('Format incorrect');

  return data as Tag[];
}

export async function createTag(name: string, token: string): Promise<Tag> {
  const res = await fetch(`${API_BASE_URL}/api/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const body = await res.json() as { message?: string };
    throw new Error(body.message ?? 'Erreur lors de la création du tag');
  }

  return (await res.json()) as Tag;
}

export async function renameTag(tagId: string, name: string, token: string): Promise<Tag> {
  const res = await fetch(`${API_BASE_URL}/api/tags/${tagId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const body = await res.json() as { message?: string };
    throw new Error(body.message ?? 'Erreur lors du renommage du tag');
  }

  return (await res.json()) as Tag;
}

export async function deleteTag(tagId: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/tags/${tagId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.json() as { message?: string };
    throw new Error(body.message ?? 'Erreur lors de la suppression du tag');
  }
}
