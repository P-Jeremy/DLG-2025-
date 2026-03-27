import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SongItem from './SongItem';
import SortToggle from './SortToggle';
import PlaylistFilter from './PlaylistFilter';
import VinylLoader from './VinylLoader';
import { fetchSongs, deleteSong } from '../api/songs';
import { fetchPlaylistsPublic, fetchPlaylistPublic } from '../api/playlists';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';
import type { Song, SortField } from '../types/song';
import type { Playlist } from '../api/playlists';
import './SongList.scss';

const REFRESH_EVENT = 'refresh';

const SongList: React.FC = () => {
  const { isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState<string | null>(null);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('title');
  const [openSongId, setOpenSongId] = useState<string | null>(null);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, playlistsData] = await Promise.all([
        fetchSongs(sortField),
        fetchPlaylistsPublic(),
      ]);
      setSongs(data);
      setPlaylists(playlistsData);
    } catch (err: unknown) {
      setError((err as Error).message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [sortField]);

  useEffect(() => {
    void loadSongs();
  }, [loadSongs]);

  useEffect(() => {
    if (!selectedPlaylistName) {
      setFilteredSongs(songs);
      return;
    }
    void fetchPlaylistPublic(selectedPlaylistName).then(({ playlist }) => {
      if (!playlist) {
        setFilteredSongs([]);
        return;
      }
      const ordered = playlist.songIds
        .map((id) => songs.find((s) => s.id === id))
        .filter((s): s is Song => s !== undefined);
      setFilteredSongs(ordered);
    });
  }, [selectedPlaylistName, songs]);

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
      <VinylLoader />
    </div>
  );
  if (error) return <div className="song-list-bg"><div className="song-list-error">Erreur : {error}</div></div>;

  return (
    <div className="song-list-bg">
      <div className="song-list-controls">
        <div className="song-list-controls-card">
          {playlists.length > 0 && (
            <PlaylistFilter
              playlists={playlists}
              selectedPlaylistName={selectedPlaylistName}
              onSelect={setSelectedPlaylistName}
            />
          )}
          <SortToggle sortField={sortField} onToggle={setSortField} />
        </div>
      </div>
      {filteredSongs.length === 0 ? (
        <div className="song-list-message">Aucune chanson trouvée.</div>
      ) : (
        <div className="song-list">
          {filteredSongs.map(song => (
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
