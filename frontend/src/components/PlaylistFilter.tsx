import React from 'react';
import type { Playlist } from '../api/playlists';
import './PlaylistFilter.scss';

interface PlaylistFilterProps {
  playlists: Playlist[];
  selectedPlaylistName: string | null;
  onSelect: (playlistName: string | null) => void;
}

const PlaylistFilter: React.FC<PlaylistFilterProps> = ({ playlists, selectedPlaylistName, onSelect }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(e.target.value || null);
  };

  return (
    <div className="playlist-filter">
      <span className="playlist-filter__label">PLAYLIST</span>
      <div className="playlist-filter__select-wrapper">
        <select
          className="playlist-filter__select"
          value={selectedPlaylistName ?? ''}
          onChange={handleChange}
        >
          <option value="">Toutes les chansons</option>
          {playlists.map((playlist) => (
            <option key={playlist.name} value={playlist.name}>
              {playlist.name}
            </option>
          ))}
        </select>
        <span className="playlist-filter__arrow">▾</span>
      </div>
    </div>
  );
};

export default PlaylistFilter;
