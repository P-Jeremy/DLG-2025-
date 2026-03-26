import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SongItem from './SongItem';
import SortToggle from './SortToggle';
import TagFilter from './TagFilter';
import { fetchSongs, fetchSongsByTag, deleteSong } from '../api/songs';
import { fetchTags } from '../api/tags';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';
import type { Song, SortField } from '../types/song';
import type { Tag } from '../api/tags';
import './SongList.scss';

const REFRESH_EVENT = 'refresh';

const SongList: React.FC = () => {
  const { isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('title');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [openSongId, setOpenSongId] = useState<string | null>(null);

  useEffect(() => {
    fetchTags()
      .then(setTags)
      .catch(() => {});
  }, []);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = selectedTagId
        ? await fetchSongsByTag(selectedTagId)
        : await fetchSongs(sortField);
      setSongs(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [sortField, selectedTagId]);

  useEffect(() => {
    void loadSongs();
  }, [loadSongs]);

  const handleRefresh = useCallback(() => {
    void loadSongs();
  }, [loadSongs]);

  const handleDeleteSong = useCallback(async (songId: string) => {
    if (!token) return;
    await deleteSong(songId, token);
    setSongs((prev) => prev.filter((s) => s.id !== songId));
  }, [token]);

  const handleEditSong = useCallback((songId: string) => {
    void navigate(`/songs/${songId}/edit`);
  }, [navigate]);

  useSocket(REFRESH_EVENT, handleRefresh);

  if (loading) return (
    <div className="song-list-bg">
      <div className="vinyl-loader-container">
        <img src="/vinyl.png" className="vinyl-loader" alt="Chargement..." />
      </div>
    </div>
  );
  if (error) return <div className="song-list-bg"><div className="song-list-error">Erreur : {error}</div></div>;

  return (
    <div className="song-list-bg">
      <div className="song-list-controls">
        <div className="song-list-controls-card">
          {tags.length > 0 && (
            <TagFilter
              tags={tags}
              selectedTagId={selectedTagId}
              onSelect={setSelectedTagId}
            />
          )}
          {!selectedTagId && (
            <SortToggle sortField={sortField} onToggle={setSortField} />
          )}
        </div>
      </div>
      {songs.length === 0 ? (
        <div className="song-list-message">Aucune chanson trouvée.</div>
      ) : (
        <div className="song-list">
          {songs.map(song => (
            <SongItem
              key={song.id}
              song={song}
              isAdmin={isAdmin}
              onDelete={isAdmin ? handleDeleteSong : undefined}
              onEdit={isAdmin ? handleEditSong : undefined}
              isOpen={openSongId === song.id}
              onOpen={setOpenSongId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SongList;
