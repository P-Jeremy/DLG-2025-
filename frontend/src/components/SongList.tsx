import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SongItem from './SongItem';
import AlphabetNav from './AlphabetNav';
import PlaylistFilter from './PlaylistFilter';
import VinylLoader from './VinylLoader';
import ShuffleBar from './ShuffleBar';
import { fetchSongs, deleteSong } from '../api/songs';
import { fetchPlaylistsPublic, fetchPlaylistPublic } from '../api/playlists';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import type { Song } from '../types/song';
import type { Playlist } from '../api/playlists';
import './SongList.scss';

const REFRESH_EVENT = 'refresh';
const SHUFFLE_DELAY_MS = 500;

function pickRandomSong(songs: Song[]): Song {
  return songs[Math.floor(Math.random() * songs.length)];
}

const SongList: React.FC = () => {
  const { isAdmin, token } = useAuth();
  const { searchQuery, sortField } = useSearch();
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState<string | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSongId, setOpenSongId] = useState<string | null>(null);
  const [shuffledSong, setShuffledSong] = useState<Song | null>(null);
  const [shuffling, setShuffling] = useState(false);
  const shuffleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current !== null) clearTimeout(shuffleTimerRef.current);
    };
  }, []);

  const withShuffleDelay = useCallback((action: () => void) => {
    if (shuffleTimerRef.current !== null) clearTimeout(shuffleTimerRef.current);
    setShuffling(true);
    shuffleTimerRef.current = window.setTimeout(() => {
      action();
      setShuffling(false);
      shuffleTimerRef.current = null;
    }, SHUFFLE_DELAY_MS);
  }, []);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, playlistsData] = await Promise.all([
        fetchSongs('title'),
        fetchPlaylistsPublic(),
      ]);
      setSongs(data);
      setPlaylists(playlistsData);
    } catch (err: unknown) {
      setError((err as Error).message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSongs();
    setShuffledSong(null);
  }, [loadSongs]);

  useEffect(() => {
    if (!selectedPlaylistName) {
      setPlaylistSongs(null);
      setShuffledSong(null);
      return;
    }
    let cancelled = false;
    setPlaylistLoading(true);
    fetchPlaylistPublic(selectedPlaylistName)
      .then(({ playlist }) => {
        if (cancelled) return;
        if (!playlist) {
          setPlaylistSongs([]);
          return;
        }
        const ordered = playlist.songIds
          .map((id) => songs.find((s) => s.id === id))
          .filter((s): s is Song => s !== undefined);
        setPlaylistSongs(ordered);
        setShuffledSong(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError((err as Error).message || 'Unknown error');
      })
      .finally(() => { if (!cancelled) setPlaylistLoading(false); });
    return () => { cancelled = true; };
  }, [selectedPlaylistName, songs]);

  const filteredSongs = useMemo(() => {
    const base = playlistSongs ?? songs;
    const query = searchQuery.toLowerCase().trim();
    const getValue = (s: Song) => (s[sortField] ?? '').toLowerCase();
    const searched = query
      ? base.filter((s) => getValue(s).startsWith(query))
      : base;
    if (playlistSongs) return searched;
    return [...searched].sort((a, b) =>
      getValue(a).localeCompare(getValue(b), undefined, { sensitivity: 'base' }),
    );
  }, [songs, playlistSongs, searchQuery, sortField]);

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

  const handleShuffle = useCallback(() => {
    withShuffleDelay(() => setShuffledSong(pickRandomSong(filteredSongs)));
  }, [filteredSongs, withShuffleDelay]);

  const handleCancelShuffle = useCallback(() => {
    withShuffleDelay(() => setShuffledSong(null));
  }, [withShuffleDelay]);

  useSocket(REFRESH_EVENT, handleRefresh);

  const isShuffleActive = shuffledSong !== null;

  if (loading) return (
    <div className="song-list-bg">
      <VinylLoader />
    </div>
  );
  if (error) return <div className="song-list-bg"><div className="song-list-error">Erreur : {error}</div></div>;

  return (
    <div className="song-list-bg">
      <ShuffleBar onShuffle={handleShuffle} />
      {!isShuffleActive && !shuffling && (
        <div className="song-list-controls">
          <div className="song-list-controls-card">
            {playlists.length > 0 && (
              <PlaylistFilter
                playlists={playlists}
                selectedPlaylistName={selectedPlaylistName}
                onSelect={setSelectedPlaylistName}
              />
            )}
          </div>
        </div>
      )}
      {playlistLoading || shuffling ? (
        <VinylLoader />
      ) : isShuffleActive ? (
        <div className="song-list">
          <SongItem
            key={shuffledSong.id}
            song={shuffledSong}
            isAdmin={isAdmin}
            onDelete={isAdmin ? handleDeleteSong : undefined}
            onEdit={isAdmin ? handleEditSong : undefined}
            isOpen={openSongId === shuffledSong.id}
            onOpen={setOpenSongId}
          />
          <button className="song-list-cancel-shuffle" onClick={handleCancelShuffle}>
            Retour à la liste
          </button>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="song-list-message">Aucune chanson trouvée.</div>
      ) : (
        <>
          {!selectedPlaylistName && (
            <div className="song-list-alphabet">
              <AlphabetNav songs={filteredSongs} sortField={sortField} />
            </div>
          )}
          <div className="song-list">
            {filteredSongs.map(song => (
              <SongItem
                key={song.id}
                song={song}
                sortField={sortField}
                isAdmin={isAdmin}
                onDelete={isAdmin ? handleDeleteSong : undefined}
                onEdit={isAdmin ? handleEditSong : undefined}
                isOpen={openSongId === song.id}
                onOpen={setOpenSongId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SongList;
