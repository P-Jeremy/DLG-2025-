import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useAuth } from '../contexts/AuthContext';
import { fetchPlaylist, reorderPlaylist, addSongToPlaylist, removeSongFromPlaylist } from '../api/playlists';
import { fetchSongs } from '../api/songs';
import type { Song } from '../types/song';
import AppBackground from '../components/AppBackground';
import Navbar from '../components/Navbar';
import SongSearchInput from '../components/SongSearchInput';
import VinylLoader from '../components/VinylLoader';
import SortablePlaylistItem from '../components/SortablePlaylistItem/SortablePlaylistItem';
import './AdminPlaylistPage.scss';

const AdminPlaylistPage: React.FC = () => {
  const navigate = useNavigate();
  const { playlistName } = useParams<{ playlistName: string }>();
  const { token, isAdmin } = useAuth();

  const [songs, setSongs] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingError, setAddingError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const loadPlaylist = useCallback(async () => {
    if (!playlistName || !token) return;
    setLoading(true);
    setError(null);
    try {
      const [playlistData, allSongsData] = await Promise.all([
        fetchPlaylist(playlistName, token),
        fetchSongs('title'),
      ]);
      setSongs(playlistData.songs);
      setAllSongs(allSongsData);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [playlistName, token]);

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

  const handleDndStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setSuccess(false);
  };

  const handleDndEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    setSongs((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSave = async () => {
    if (!playlistName || !token) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await reorderPlaylist(playlistName, songs.map((s) => s.id), token);
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlistName || !token) return;
    setRemovingId(songId);
    setError(null);
    try {
      await removeSongFromPlaylist(playlistName, songId, token);
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
    if (!playlistName || !token) return;
    setAddingError(null);
    try {
      await addSongToPlaylist(playlistName, song.id, token);
      setSongs((prev) => [...prev, song]);
      setSuccess(false);
    } catch (err: unknown) {
      setAddingError((err as Error).message);
    }
  };

  if (!isAdmin) {
    return (
      <AppBackground>
        <Navbar />
        <div className="admin-playlist-page">
          <div className="admin-playlist-forbidden">Accès réservé aux administrateurs.</div>
        </div>
      </AppBackground>
    );
  }

  if (loading) {
    return (
      <AppBackground>
        <Navbar />
        <div className="admin-playlist-page">
          <VinylLoader />
        </div>
      </AppBackground>
    );
  }

  const playlistSongIds = songs.map((s) => s.id);
  const activeSong = activeId ? songs.find((s) => s.id === activeId) ?? null : null;

  return (
    <AppBackground>
      <Navbar />
      <div className="admin-playlist-page">
        <div className="admin-playlist-card">
          <div className="admin-playlist-header">
            <h1 className="admin-playlist-title">Ordre de la playlist</h1>
            <button
              className="admin-playlist-back"
              type="button"
              onClick={() => void navigate('/admin/playlists')}
            >
              Retour aux playlists
            </button>
          </div>

          {error && <div className="admin-playlist-error">{error}</div>}
          {addingError && <div className="admin-playlist-error">{addingError}</div>}
          {success && <div className="admin-playlist-success">Playlist sauvegardée avec succès.</div>}

          <SongSearchInput
            allSongs={allSongs}
            playlistSongIds={playlistSongIds}
            onAddSong={(song) => void handleAddSong(song)}
            disabled={saving}
          />

          {songs.length === 0 ? (
            <div className="admin-playlist-empty">Aucune chanson dans cette playlist.</div>
          ) : (
            <>
              <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDndStart}
                onDragEnd={handleDndEnd}
              >
                <SortableContext items={songs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <ul className="admin-playlist-list">
                    {songs.map((song, index) => (
                      <SortablePlaylistItem
                        key={song.id}
                        song={song}
                        index={index}
                        totalCount={songs.length}
                        saving={saving}
                        confirmRemoveId={confirmRemoveId}
                        removingId={removingId}
                        onMove={moveSong}
                        onConfirmRemove={setConfirmRemoveId}
                        onCancelRemove={() => setConfirmRemoveId(null)}
                        onRemove={(id) => void handleRemoveSong(id)}
                      />
                    ))}
                  </ul>
                </SortableContext>
                <DragOverlay>
                  {activeSong && (
                    <div className="admin-playlist-item admin-playlist-item--overlay">
                      <span className="admin-playlist-item__drag-handle" aria-hidden="true">⋮⋮</span>
                      <div className="admin-playlist-item__info">
                        <span className="admin-playlist-item__title">{activeSong.title}</span>
                        <span className="admin-playlist-item__author">{activeSong.author}</span>
                      </div>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
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
        </div>
      </div>
    </AppBackground>
  );
};

export default AdminPlaylistPage;
