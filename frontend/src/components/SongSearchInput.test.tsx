import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import SongSearchInput from './SongSearchInput';
import type { Song } from '../types/song';

const songs: Song[] = [
  { id: 'song-1', title: 'Alpha', author: 'Artist A' },
  { id: 'song-2', title: 'Beta', author: 'Artist B' },
  { id: 'song-3', title: 'Gamma', author: 'Artist C' },
];

const renderComponent = (
  playlistSongIds: string[] = [],
  onAddSong: (song: Song) => void = jest.fn(),
  disabled = false,
) =>
  render(
    <SongSearchInput
      allSongs={songs}
      playlistSongIds={playlistSongIds}
      onAddSong={onAddSong}
      disabled={disabled}
    />,
  );

describe('SongSearchInput', () => {
  it('renders the search input', () => {
    renderComponent();
    expect(screen.getByRole('textbox', { name: 'Rechercher une chanson à ajouter' })).toBeInTheDocument();
  });

  it('shows no results when query is empty', () => {
    renderComponent();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('filters songs matching the query', () => {
    renderComponent();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'alpha' } });
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  it('excludes songs already in the playlist', () => {
    renderComponent(['song-1']);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'al' } });
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });

  it('calls onAddSong with the selected song when a result is clicked', () => {
    const onAddSong = jest.fn();
    renderComponent([], onAddSong);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'beta' } });
    fireEvent.click(screen.getByText('Beta'));
    expect(onAddSong).toHaveBeenCalledWith(songs[1]);
  });

  it('clears the input after a song is selected', () => {
    renderComponent();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'beta' } });
    fireEvent.click(screen.getByText('Beta'));
    expect(input).toHaveValue('');
  });

  it('shows author next to song title in results', () => {
    renderComponent();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'gamma' } });
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.getByText('Artist C')).toBeInTheDocument();
  });

  it('disables the input when disabled prop is true', () => {
    renderComponent([], jest.fn(), true);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
