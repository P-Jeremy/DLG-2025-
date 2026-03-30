import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchPlaylists, createPlaylist, renamePlaylist, deletePlaylist } from '../api/playlists';
import { getErrorMessage } from '../utils/errorHandling';
import type { Playlist } from '../api/playlists';
import AppBackground from '../components/AppBackground';
import Navbar from '../components/Navbar';
import PlaylistDeleteConfirm from '../components/PlaylistDeleteConfirm';
import PlaylistRenameInput from '../components/PlaylistRenameInput';
import './AdminPlaylistsManagePage.scss';

type PlaylistAction = { type: 'delete' | 'rename'; playlistName: string };

const AdminPlaylistsManagePage: React.FC = () => {
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<PlaylistAction | null>(null);

  const loadPlaylists = useCallback(() => {
    if (!token) return;
    setFetchError(null);
    fetchPlaylists(token)
      .then(setPlaylists)
      .catch(() => setFetchError('Impossible de charger les playlists.'));
  }, [token]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!newPlaylistName.trim()) return;
    if (!token) return;

    setLoading(true);
    try {
      await createPlaylist(newPlaylistName.trim(), token);
      setNewPlaylistName('');
      setActionSuccess('Playlist créée avec succès.');
      loadPlaylists();
    } catch (err: unknown) {
      setActionError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (playlist: Playlist) => {
    setActiveAction({ type: 'delete', playlistName: playlist.name });
    setActionError(null);
    setActionSuccess(null);
  };

  const handleDeleteConfirm = async (playlist: Playlist) => {
    if (!token) return;
    setActionError(null);
    setActionSuccess(null);
    setLoading(true);
    try {
      await deletePlaylist(playlist.name, token);
      setActionSuccess(`Playlist "${playlist.name}" supprimée.`);
      setActiveAction(null);
      loadPlaylists();
    } catch (err: unknown) {
      setActionError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRenameRequest = (playlist: Playlist) => {
    setActiveAction({ type: 'rename', playlistName: playlist.name });
    setActionError(null);
    setActionSuccess(null);
  };

  const handleRenameConfirm = async (playlist: Playlist, newName: string) => {
    if (!token) return;
    setActionError(null);
    setActionSuccess(null);
    setLoading(true);
    try {
      const updated = await renamePlaylist(playlist.name, newName, token);
      setPlaylists((prev) => prev.map((p) => (p.name === playlist.name ? updated : p)));
      setActionSuccess(`Playlist renommée en "${updated.name}".`);
      setActiveAction(null);
    } catch (err: unknown) {
      setActionError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAction = () => {
    setActiveAction(null);
  };

  if (!isAdmin) {
    return (
      <AppBackground>
        <Navbar />
        <div className="admin-playlists-manage-page">
          <div className="admin-playlists-manage-forbidden">Accès réservé aux administrateurs.</div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <Navbar />
      <div className="admin-playlists-manage-page">
        <div className="admin-playlists-manage-card">
          <div className="admin-playlists-manage-header">
            <h1 className="admin-playlists-manage-title">Gérer les playlists</h1>
            <button
              className="admin-playlists-manage-back"
              type="button"
              onClick={() => void navigate('/')}
            >
              Retour
            </button>
          </div>

          {fetchError && <div className="admin-playlists-manage-error">{fetchError}</div>}
          {actionError && <div className="admin-playlists-manage-error">{actionError}</div>}
          {actionSuccess && <div className="admin-playlists-manage-success">{actionSuccess}</div>}

          <form className="admin-playlists-manage-form" onSubmit={(e) => void handleCreate(e)} noValidate>
            <input
              className="admin-playlists-manage-input"
              type="text"
              placeholder="Nom de la nouvelle playlist"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              disabled={loading}
              aria-label="Nom de la nouvelle playlist"
            />
            <button
              className="admin-playlists-manage-create-btn"
              type="submit"
              disabled={loading || !newPlaylistName.trim()}
            >
              Créer
            </button>
          </form>

          <ul className="admin-playlists-manage-list">
            {playlists.map((playlist) => (
              <li key={playlist.name} className="admin-playlists-manage-item">
                {activeAction?.type === 'rename' && activeAction.playlistName === playlist.name ? (
                  <PlaylistRenameInput
                    playlist={playlist}
                    onConfirm={(newName) => handleRenameConfirm(playlist, newName)}
                    onCancel={handleCancelAction}
                    disabled={loading}
                  />
                ) : (
                  <span className="admin-playlists-manage-item__name">{playlist.name}</span>
                )}
                {!(activeAction?.type === 'rename' && activeAction.playlistName === playlist.name) && (
                  <div className="admin-playlists-manage-item__actions">
                    <Link
                      className="admin-playlists-manage-item__playlist-link"
                      to={`/admin/playlists/${encodeURIComponent(playlist.name)}`}
                    >
                      Gérer la playlist
                    </Link>
                    <button
                      className="admin-playlists-manage-item__rename-btn"
                      type="button"
                      disabled={loading}
                      aria-label="Renommer la playlist"
                      onClick={() => handleRenameRequest(playlist)}
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    {activeAction?.type === 'delete' && activeAction.playlistName === playlist.name ? (
                      <PlaylistDeleteConfirm
                        onConfirm={() => void handleDeleteConfirm(playlist)}
                        onCancel={handleCancelAction}
                        disabled={loading}
                      />
                    ) : (
                      <button
                        className="admin-playlists-manage-item__delete-btn"
                        type="button"
                        disabled={loading}
                        aria-label="Supprimer la playlist"
                        onClick={() => handleDeleteRequest(playlist)}
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
            {playlists.length === 0 && !fetchError && (
              <li className="admin-playlists-manage-empty">Aucune playlist créée.</li>
            )}
          </ul>
        </div>
      </div>
    </AppBackground>
  );
};

export default AdminPlaylistsManagePage;
