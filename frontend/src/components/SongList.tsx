import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ScrollToTopButton from './ScrollToTopButton';
import { useNavigate } from 'react-router-dom';
import SongItem from './SongItem';
import AlphabetNav from './AlphabetNav';
import PlaylistFilter from './PlaylistFilter';
import VinylLoader from './VinylLoader';
import ShuffleBar from './ShuffleBar';
import { fetchSongs, deleteSong } from '../api/songs';
import { fetchPlaylistsPublic } from '../api/playlists';
import { useSocket } from '../hooks/useSocket';
import { useApiCacheUpdate } from '../hooks/useApiCacheUpdate';
import { useMetaSync, confirmPendingSync } from '../hooks/useMetaSync';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { SONG_EVENTS } from '../constants/events';
import { getErrorMessage } from '../utils/errorHandling';
import type { Song } from '../types/song';
import type { Playlist } from '../api/playlists';
import './SongList.scss';

const SHUFFLE_DELAY_MS = 500;
const MIN_LOADING_DURATION_MS = 800;

function pickRandomSong(songs: Song[]): Song {
  return songs[Math.floor(Math.random() * songs.length)];
}

type SongListRenderState = 'loading' | 'shuffle-active' | 'empty' | 'songs-list';

function getSongListRenderState(
  isLoading: boolean,
  isShuffleActive: boolean,
  songCount: number,
): SongListRenderState {
  if (isLoading) return 'loading';

  if (isShuffleActive) return 'shuffle-active';

  const isPlaylistEmpty = songCount === 0;
  if (isPlaylistEmpty) return 'empty';

  return 'songs-list';
}

const SongList: React.FC = () => {
  const { isAdmin, token } = useAuth();
  const { searchQuery, setSearchVisible } = useSearch();
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState<string | null>(null);
  const [pendingPlaylistName, setPendingPlaylistName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
        fetchSongs(),
        fetchPlaylistsPublic(),
        new Promise<void>((resolve) => setTimeout(resolve, MIN_LOADING_DURATION_MS)),
      ]);
      setSongs(data);
      setPlaylists(playlistsData);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSongs();
    setShuffledSong(null);
  }, [loadSongs]);

  const playlistSongs = useMemo(() => {
    if (selectedPlaylistName === null) return null;
    const playlist = playlists.find((p) => p.name === selectedPlaylistName);
    if (!playlist) return [];
    return playlist.songIds
      .map((id) => songs.find((s) => s.id === id))
      .filter((s): s is Song => s !== undefined);
  }, [selectedPlaylistName, playlists, songs]);

  const filteredSongs = useMemo(() => {
    const base = playlistSongs ?? songs;
    const query = searchQuery.toLowerCase().trim();
    const searched = query
      ? base.filter((s) =>
          s.title.toLowerCase().startsWith(query) ||
          (s.author ?? '').toLowerCase().startsWith(query)
        )
      : base;
    if (playlistSongs) return searched;
    return [...searched].sort((a, b) =>
      a.title.toLowerCase().localeCompare(b.title.toLowerCase(), undefined, { sensitivity: 'base' }),
    );
  }, [songs, playlistSongs, searchQuery]);

  const handlePlaylistSelect = useCallback((name: string | null) => {
    withShuffleDelay(() => {
      setSelectedPlaylistName(name);
      setPendingPlaylistName(null);
      setShuffledSong(null);
    });
    setPendingPlaylistName(name);
  }, [withShuffleDelay]);

  const handleRefresh = useCallback(() => {
    void loadSongs();
  }, [loadSongs]);

  const handleCacheUpdate = useCallback(() => {
    confirmPendingSync();
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

  useSocket(SONG_EVENTS.REFRESH, handleRefresh);
  useApiCacheUpdate(handleCacheUpdate);
  useMetaSync(loadSongs);

  const isShuffleActive = shuffledSong !== null;
  const effectivePlaylistName = pendingPlaylistName ?? selectedPlaylistName;

  useEffect(() => {
    setSearchVisible(!isShuffleActive && !effectivePlaylistName);
  }, [isShuffleActive, effectivePlaylistName, setSearchVisible]);

  if (loading) return (
    <div className="song-list-bg">
      <VinylLoader />
    </div>
  );
  if (error) return <div className="song-list-bg"><div className="song-list-error">Erreur : {error}</div></div>;

  const renderState = getSongListRenderState(
    shuffling,
    isShuffleActive,
    filteredSongs.length,
  );

  const renderContent = (): React.ReactNode => {
    switch (renderState) {
      case 'loading':
        return <VinylLoader />;

      case 'shuffle-active':
        return (
          <div className="song-list">
            <SongItem
              key={shuffledSong!.id}
              song={shuffledSong!}
              isAdmin={isAdmin}
              onDelete={isAdmin ? handleDeleteSong : undefined}
              onEdit={isAdmin ? handleEditSong : undefined}
              isOpen={openSongId === shuffledSong!.id}
              onOpen={setOpenSongId}
            />
            <button className="song-list-cancel-shuffle" onClick={handleCancelShuffle}>
              Retour à la liste
            </button>
          </div>
        );

      case 'empty':
        return <div className="song-list-message">Aucune chanson trouvée.</div>;

      case 'songs-list':
        return (
          <>
            {!effectivePlaylistName && (
              <div className="song-list-alphabet">
                <AlphabetNav songs={filteredSongs} />
              </div>
            )}
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
          </>
        );
    }
  };

  return (
    <div className="song-list-bg">
      <ScrollToTopButton />
      {!effectivePlaylistName && <ShuffleBar onShuffle={handleShuffle} />}
      {!isShuffleActive && !shuffling && (
        <div className="song-list-controls">
          <div className="song-list-controls-card">
            {playlists.length > 0 && (
              <PlaylistFilter
                playlists={playlists}
                selectedPlaylistName={selectedPlaylistName}
                onSelect={handlePlaylistSelect}
              />
            )}
          </div>
        </div>
      )}
      {renderContent()}
    </div>
  );
};

export default SongList;
