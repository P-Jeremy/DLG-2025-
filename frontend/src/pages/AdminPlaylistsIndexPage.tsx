import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchTags } from '../api/tags';
import type { Tag } from '../api/tags';
import AppBackground from '../components/AppBackground';
import './AdminTagsPage.scss';

const AdminPlaylistsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags()
      .then(setTags)
      .catch(() => setError('Impossible de charger les tags.'));
  }, []);

  if (!isAdmin) {
    return (
      <AppBackground>
        <div className="admin-tags-page">
          <div className="admin-tags-forbidden">Accès réservé aux administrateurs.</div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
    <div className="admin-tags-page">
      <div className="admin-tags-card">
        <div className="admin-tags-header">
          <h1 className="admin-tags-title">Gérer les playlists</h1>
          <button
            className="admin-tags-back"
            type="button"
            onClick={() => void navigate('/')}
          >
            Retour
          </button>
        </div>

        {error && <div className="admin-tags-error">{error}</div>}

        {tags.length === 0 && !error ? (
          <div className="admin-tags-empty">
            Aucun tag créé.{' '}
            <Link to="/admin/tags">Créer des tags</Link> pour gérer les playlists.
          </div>
        ) : (
          <ul className="admin-tags-list">
            {tags.map((tag) => (
              <li key={tag.id} className="admin-tags-item">
                <span className="admin-tags-item__name">{tag.name}</span>
                <Link
                  className="admin-tags-item__playlist-link"
                  to={`/admin/playlists/${tag.id}`}
                >
                  Gérer la playlist
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    </AppBackground>
  );
};

export default AdminPlaylistsIndexPage;
