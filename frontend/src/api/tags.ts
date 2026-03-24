export interface Tag {
  id: string;
  name: string;
}

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch('/api/tags');
  if (!res.ok) throw new Error('Erreur lors du chargement des tags');
  const data = await res.json() as unknown;

  if (!Array.isArray(data)) throw new Error('Format incorrect');

  return data as Tag[];
}
