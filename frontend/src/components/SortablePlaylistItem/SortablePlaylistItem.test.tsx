import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import SortablePlaylistItem from './SortablePlaylistItem';
import type { Song } from '../../types/song';

const mockSong: Song = { id: 'song-1', title: 'Alpha', author: 'Artist A' };
const mockSong2: Song = { id: 'song-2', title: 'Beta', author: 'Artist B' };
const mockSong3: Song = { id: 'song-3', title: 'Gamma', author: 'Artist C' };

const defaultProps = {
  saving: false,
  confirmRemoveId: null,
  removingId: null,
  onMove: jest.fn(),
  onConfirmRemove: jest.fn(),
  onCancelRemove: jest.fn(),
  onRemove: jest.fn(),
};

const renderInDndContext = (song: Song, index: number, totalCount: number, overrides = {}) => {
  const props = { ...defaultProps, ...overrides };
  return render(
    <DndContext>
      <SortableContext items={[song.id]}>
        <ul>
          <SortablePlaylistItem
            song={song}
            index={index}
            totalCount={totalCount}
            {...props}
          />
        </ul>
      </SortableContext>
    </DndContext>,
  );
};

describe('SortablePlaylistItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders song title and author', () => {
    renderInDndContext(mockSong, 0, 3);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Artist A')).toBeInTheDocument();
  });

  it('renders position number starting at 1', () => {
    renderInDndContext(mockSong, 2, 3);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('disables up button when item is at first position', () => {
    renderInDndContext(mockSong, 0, 3);
    const upButton = screen.getByRole('button', { name: 'Monter' });
    expect(upButton).toBeDisabled();
  });

  it('disables down button when item is at last position', () => {
    renderInDndContext(mockSong3, 2, 3);
    const downButton = screen.getByRole('button', { name: 'Descendre' });
    expect(downButton).toBeDisabled();
  });

  it('enables both up and down buttons for a middle item', () => {
    renderInDndContext(mockSong2, 1, 3);
    expect(screen.getByRole('button', { name: 'Monter' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Descendre' })).not.toBeDisabled();
  });

  it('calls onMove with up direction when up button is clicked', () => {
    const onMove = jest.fn();
    renderInDndContext(mockSong2, 1, 3, { onMove });
    fireEvent.click(screen.getByRole('button', { name: 'Monter' }));
    expect(onMove).toHaveBeenCalledWith(1, 'up');
  });

  it('calls onMove with down direction when down button is clicked', () => {
    const onMove = jest.fn();
    renderInDndContext(mockSong2, 1, 3, { onMove });
    fireEvent.click(screen.getByRole('button', { name: 'Descendre' }));
    expect(onMove).toHaveBeenCalledWith(1, 'down');
  });

  it('shows delete button when confirmRemoveId does not match song id', () => {
    renderInDndContext(mockSong, 0, 3);
    expect(screen.getByRole('button', { name: /Retirer Alpha de la playlist/i })).toBeInTheDocument();
  });

  it('calls onConfirmRemove when delete button is clicked', () => {
    const onConfirmRemove = jest.fn();
    renderInDndContext(mockSong, 0, 3, { onConfirmRemove });
    fireEvent.click(screen.getByRole('button', { name: /Retirer Alpha de la playlist/i }));
    expect(onConfirmRemove).toHaveBeenCalledWith('song-1');
  });

  it('shows remove confirmation when confirmRemoveId matches song id', () => {
    renderInDndContext(mockSong, 0, 3, { confirmRemoveId: 'song-1' });
    expect(screen.getByRole('button', { name: /Confirmer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
  });

  it('calls onRemove when confirm button is clicked', () => {
    const onRemove = jest.fn();
    renderInDndContext(mockSong, 0, 3, { confirmRemoveId: 'song-1', onRemove });
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));
    expect(onRemove).toHaveBeenCalledWith('song-1');
  });

  it('calls onCancelRemove when cancel button is clicked', () => {
    const onCancelRemove = jest.fn();
    renderInDndContext(mockSong, 0, 3, { confirmRemoveId: 'song-1', onCancelRemove });
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    expect(onCancelRemove).toHaveBeenCalled();
  });

  it('disables up and down buttons when saving is true', () => {
    renderInDndContext(mockSong2, 1, 3, { saving: true });
    expect(screen.getByRole('button', { name: 'Monter' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Descendre' })).toBeDisabled();
  });
});
