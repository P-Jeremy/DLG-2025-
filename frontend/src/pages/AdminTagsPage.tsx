import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchTags, createTag, deleteTag, renameTag } from '../api/tags';
import type { Tag } from '../api/tags';
import AppBackground from '../components/AppBackground';
import TagDeleteConfirm from '../components/TagDeleteConfirm';
import TagRenameInput from '../components/TagRenameInput';
import './AdminTagsPage.scss';

type TagAction = { type: 'delete' | 'rename'; tagId: string };

const AdminTagsPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();

  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<TagAction | null>(null);

  const loadTags = () => {
    setFetchError(null);
    fetchTags()
      .then(setTags)
      .catch(() => setFetchError('Impossible de charger les tags.'));
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!newTagName.trim()) return;
    if (!token) return;

    setLoading(true);
    try {
      await createTag(newTagName.trim(), token);
      setNewTagName('');
      setActionSuccess('Tag créé avec succès.');
      loadTags();
    } catch (err: unknown) {
      setActionError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (tag: Tag) => {
    setActiveAction({ type: 'delete', tagId: tag.id });
    setActionError(null);
    setActionSuccess(null);
  };

  const handleDeleteConfirm = async (tag: Tag) => {
    if (!token) return;
    setActionError(null);
    setActionSuccess(null);
    setLoading(true);
    try {
      await deleteTag(tag.id, token);
      setActionSuccess(`Tag "${tag.name}" supprimé.`);
      setActiveAction(null);
      loadTags();
    } catch (err: unknown) {
      setActionError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRenameRequest = (tag: Tag) => {
    setActiveAction({ type: 'rename', tagId: tag.id });
    setActionError(null);
    setActionSuccess(null);
  };

  const handleRenameConfirm = async (tagId: string, newName: string) => {
    if (!token) return;
    setActionError(null);
    setActionSuccess(null);
    setLoading(true);
    try {
      const updatedTag = await renameTag(tagId, newName, token);
      setTags((prev) => prev.map((t) => (t.id === tagId ? updatedTag : t)));
      setActionSuccess(`Tag renommé en "${updatedTag.name}".`);
      setActiveAction(null);
    } catch (err: unknown) {
      setActionError((err as Error).message);
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
          <h1 className="admin-tags-title">Gérer les tags</h1>
          <button
            className="admin-tags-back"
            type="button"
            onClick={() => void navigate('/')}
          >
            Retour
          </button>
        </div>

        {fetchError && <div className="admin-tags-error">{fetchError}</div>}
        {actionError && <div className="admin-tags-error">{actionError}</div>}
        {actionSuccess && <div className="admin-tags-success">{actionSuccess}</div>}

        <form className="admin-tags-form" onSubmit={(e) => void handleCreate(e)} noValidate>
          <input
            className="admin-tags-input"
            type="text"
            placeholder="Nom du nouveau tag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            disabled={loading}
            aria-label="Nom du nouveau tag"
          />
          <button
            className="admin-tags-create-btn"
            type="submit"
            disabled={loading || !newTagName.trim()}
          >
            Créer
          </button>
        </form>

        <ul className="admin-tags-list">
          {tags.map((tag) => (
            <li key={tag.id} className="admin-tags-item">
              {activeAction?.type === 'rename' && activeAction.tagId === tag.id ? (
                <TagRenameInput
                  tag={tag}
                  onConfirm={handleRenameConfirm}
                  onCancel={handleCancelAction}
                  disabled={loading}
                />
              ) : (
                <span className="admin-tags-item__name">{tag.name}</span>
              )}
              {!(activeAction?.type === 'rename' && activeAction.tagId === tag.id) && (
                <div className="admin-tags-item__actions">
                  <Link
                    className="admin-tags-item__playlist-link"
                    to={`/admin/playlists/${tag.id}`}
                  >
                    Gérer la playlist
                  </Link>
                  <button
                    className="admin-tags-item__rename-btn"
                    type="button"
                    disabled={loading}
                    aria-label="Renommer le tag"
                    onClick={() => handleRenameRequest(tag)}
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  {activeAction?.type === 'delete' && activeAction.tagId === tag.id ? (
                    <TagDeleteConfirm
                      onConfirm={() => void handleDeleteConfirm(tag)}
                      onCancel={handleCancelAction}
                      disabled={loading}
                    />
                  ) : (
                    <button
                      className="admin-tags-item__delete-btn"
                      type="button"
                      disabled={loading}
                      aria-label="Supprimer le tag"
                      onClick={() => handleDeleteRequest(tag)}
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
          {tags.length === 0 && !fetchError && (
            <li className="admin-tags-empty">Aucun tag créé.</li>
          )}
        </ul>
      </div>
    </div>
    </AppBackground>
  );
};

export default AdminTagsPage;
