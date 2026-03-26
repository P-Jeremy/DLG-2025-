import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchUsers, setUserRole } from '../../api/users';
import type { UserItem } from '../../api/users';
import AppBackground from '../../components/AppBackground';
import Navbar from '../../components/Navbar';
import UserRoleRow from '../../components/UserRoleRow/UserRoleRow';
import './AdminUsersPage.scss';

const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, userId } = useAuth();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setFetchError(null);
    fetchUsers(token)
      .then(setUsers)
      .catch(() => setFetchError('Impossible de charger les utilisateurs.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleToggle = async (targetUserId: string, isAdmin: boolean) => {
    if (!token) return;
    setActionError(null);
    try {
      const updated = await setUserRole(targetUserId, isAdmin, token);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err: unknown) {
      setActionError((err as Error).message);
    }
  };

  return (
    <AppBackground>
      <Navbar />
      <div className="admin-users-page">
        <div className="admin-users-card">
          <div className="admin-users-header">
            <h1 className="admin-users-title">Gérer les utilisateurs</h1>
            <button
              className="admin-users-back"
              type="button"
              onClick={() => void navigate('/')}
            >
              Retour
            </button>
          </div>

          {fetchError && <div className="admin-users-error">{fetchError}</div>}
          {actionError && <div className="admin-users-error">{actionError}</div>}

          {loading ? (
            <div className="admin-users-loading">Chargement...</div>
          ) : (
            <div className="admin-users-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th className="admin-users-table__th">Email</th>
                    <th className="admin-users-table__th">Pseudo</th>
                    <th className="admin-users-table__th admin-users-table__th--center">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <UserRoleRow
                      key={user.id}
                      user={user}
                      isCurrentUser={user.id === userId}
                      onToggle={(id, isAdmin) => void handleToggle(id, isAdmin)}
                    />
                  ))}
                </tbody>
              </table>
              {users.length === 0 && !fetchError && (
                <div className="admin-users-empty">Aucun utilisateur trouvé.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppBackground>
  );
};

export default AdminUsersPage;
