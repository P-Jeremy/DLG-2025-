import React, { useState, useMemo } from 'react';
import type { Song } from '../types/song';
import './SongSearchInput.scss';

interface SongSearchInputProps {
  allSongs: Song[];
  playlistSongIds: string[];
  onAddSong: (song: Song) => void;
  disabled: boolean;
}

const SongSearchInput: React.FC<SongSearchInputProps> = ({
  allSongs,
  playlistSongIds,
  onAddSong,
  disabled,
}) => {
  const [query, setQuery] = useState('');

  const playlistSongIdSet = useMemo(() => new Set(playlistSongIds), [playlistSongIds]);

  const filteredSongs = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return allSongs.filter(
      (song) =>
        !playlistSongIdSet.has(song.id) &&
        (song.title.toLowerCase().includes(lowerQuery) ||
          (song.author ?? '').toLowerCase().includes(lowerQuery)),
    );
  }, [query, allSongs, playlistSongIdSet]);

  const handleSelect = (song: Song) => {
    onAddSong(song);
    setQuery('');
  };

  return (
    <div className="song-search-input">
      <input
        className="song-search-input__field"
        type="text"
        placeholder="Rechercher une chanson à ajouter..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
        aria-label="Rechercher une chanson à ajouter"
      />
      {filteredSongs.length > 0 && (
        <ul className="song-search-input__results">
          {filteredSongs.map((song) => (
            <li key={song.id} className="song-search-input__result-item">
              <button
                className="song-search-input__result-btn"
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(song)}
              >
                <span className="song-search-input__result-title">{song.title}</span>
                {song.author && (
                  <span className="song-search-input__result-author">{song.author}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SongSearchInput;
