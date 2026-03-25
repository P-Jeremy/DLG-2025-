import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchPlaylist, reorderPlaylist, addSongToPlaylist, removeSongFromPlaylist } from '../api/playlists';
import { fetchSongs } from '../api/songs';
import type { Song } from '../types/song';
import AppBackground from '../components/AppBackground';
import SongSearchInput from '../components/SongSearchInput';
import PlaylistSongRemoveConfirm from '../components/PlaylistSongRemoveConfirm';
import './AdminPlaylistPage.scss';

const AdminPlaylistPage: React.FC = () => {
  const navigate = useNavigate();
  const { tagId } = useParams<{ tagId: string }>();
  const { token, isAdmin } = useAuth();

  const [songs, setSongs] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingError, setAddingError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const draggedIndexRef = useRef<number | null>(null);

  const loadPlaylist = useCallback(async () => {
    if (!tagId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const [playlistData, allSongsData] = await Promise.all([
        fetchPlaylist(tagId, token),
        fetchSongs('title'),
      ]);
      setSongs(playlistData.songs);
      setAllSongs(allSongsData);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [tagId, token]);

  useEffect(() => {
    void loadPlaylist();
  }, [loadPlaylist]);

  const moveSong = (index: number, direction: 'up' | 'down') => {
    setSongs((prev) => {
      const updated = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return updated;
    });
    setSuccess(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    draggedIndexRef.current = index;
    setSuccess(false);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const fromIndex = draggedIndexRef.current;
    if (fromIndex === null || fromIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      draggedIndexRef.current = null;
      return;
    }
    setSongs((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(dropIndex, 0, removed);
      return updated;
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedIndexRef.current = null;
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedIndexRef.current = null;
  };

  const handleSave = async () => {
    if (!tagId || !token) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await reorderPlaylist(tagId, songs.map((s) => s.id), token);
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!tagId || !token) return;
    setRemovingId(songId);
    setError(null);
    try {
      await removeSongFromPlaylist(tagId, songId, token);
      setSongs((prev) => prev.filter((s) => s.id !== songId));
      setConfirmRemoveId(null);
      setSuccess(false);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddSong = async (song: Song) => {
    if (!tagId || !token) return;
    setAddingError(null);
    try {
      await addSongToPlaylist(tagId, song.id, token);
      setSongs((prev) => [...prev, song]);
      setSuccess(false);
    } catch (err: unknown) {
      setAddingError((err as Error).message);
    }
  };

  if (!isAdmin) {
    return (
      <AppBackground>
        <div className="admin-playlist-page">
          <div className="admin-playlist-forbidden">Accès réservé aux administrateurs.</div>
        </div>
      </AppBackground>
    );
  }

  if (loading) {
    return (
      <AppBackground>
        <div className="admin-playlist-page">
          <div className="admin-playlist-loading">Chargement...</div>
        </div>
      </AppBackground>
    );
  }

  const playlistSongIds = songs.map((s) => s.id);

  return (
    <AppBackground>
    <div className="admin-playlist-page">
      <div className="admin-playlist-card">
        <div className="admin-playlist-header">
          <h1 className="admin-playlist-title">Ordre de la playlist</h1>
          <button
            className="admin-playlist-back"
            type="button"
            onClick={() => void navigate('/admin/tags')}
          >
            Retour aux tags
          </button>
        </div>

        {error && <div className="admin-playlist-error">{error}</div>}
        {addingError && <div className="admin-playlist-error">{addingError}</div>}
        {success && <div className="admin-playlist-success">Playlist sauvegardée avec succès.</div>}

        {songs.length === 0 ? (
          <div className="admin-playlist-empty">Aucune chanson dans ce tag.</div>
        ) : (
          <>
            <ul className="admin-playlist-list">
              {songs.map((song, index) => (
                <li
                  key={song.id}
                  className={[
                    'admin-playlist-item',
                    draggedIndex === index ? 'admin-playlist-item--dragging' : '',
                    dragOverIndex === index && draggedIndex !== index ? 'admin-playlist-item--drag-over' : '',
                  ].filter(Boolean).join(' ')}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <span className="admin-playlist-item__drag-handle" aria-hidden="true">⋮⋮</span>
                  <span className="admin-playlist-item__position">{index + 1}</span>
                  <div className="admin-playlist-item__info">
                    <span className="admin-playlist-item__title">{song.title}</span>
                    <span className="admin-playlist-item__author">{song.author}</span>
                  </div>
                  <div className="admin-playlist-item__controls">
                    <button
                      className="admin-playlist-item__btn"
                      type="button"
                      disabled={index === 0 || saving}
                      onClick={() => moveSong(index, 'up')}
                      aria-label="Monter"
                    >
                      ▲
                    </button>
                    <button
                      className="admin-playlist-item__btn"
                      type="button"
                      disabled={index === songs.length - 1 || saving}
                      onClick={() => moveSong(index, 'down')}
                      aria-label="Descendre"
                    >
                      ▼
                    </button>
                  </div>
                  {confirmRemoveId === song.id ? (
                    <PlaylistSongRemoveConfirm
                      onConfirm={() => void handleRemoveSong(song.id)}
                      onCancel={() => setConfirmRemoveId(null)}
                      disabled={removingId === song.id}
                    />
                  ) : (
                    <button
                      className="admin-playlist-item__remove-btn"
                      type="button"
                      disabled={saving || removingId !== null}
                      onClick={(e) => { e.stopPropagation(); setConfirmRemoveId(song.id); }}
                      aria-label={`Retirer ${song.title} de la playlist`}
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="admin-playlist-actions">
              <button
                className="admin-playlist-save-btn"
                type="button"
                disabled={saving}
                onClick={() => void handleSave()}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </>
        )}

        <SongSearchInput
          allSongs={allSongs}
          playlistSongIds={playlistSongIds}
          onAddSong={(song) => void handleAddSong(song)}
          disabled={saving}
        />
      </div>
    </div>
    </AppBackground>
  );
};

export default AdminPlaylistPage;
