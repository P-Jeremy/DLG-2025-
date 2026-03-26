import { API_BASE_URL } from './config';

export interface UserItem {
  id: string;
  email: string;
  pseudo: string;
  isAdmin: boolean;
}

export async function fetchUsers(token: string): Promise<UserItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json() as { message?: string };
    throw new Error(body.message ?? 'Erreur lors du chargement des utilisateurs');
  }
  return res.json() as Promise<UserItem[]>;
}

export async function setUserRole(userId: string, isAdmin: boolean, token: string): Promise<UserItem> {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isAdmin }),
  });
  if (!res.ok) {
    const body = await res.json() as { message?: string };
    throw new Error(body.message ?? 'Erreur lors de la modification du rôle');
  }
  return res.json() as Promise<UserItem>;
}
