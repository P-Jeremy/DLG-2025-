import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import SongItem from './SongItem';
import type { Song } from '../types/song';

const song: Song = {
  id: '1',
  title: 'Test Song',
  author: 'Test Author',
  lyrics: '<b>Paroles test</b>',
  tab: 'https://example.com/tab.png',
};

const renderClosed = (props: Partial<Parameters<typeof SongItem>[0]> = {}) =>
  render(<SongItem song={song} isOpen={false} onOpen={jest.fn()} {...props} />);

const SongItemControlled = (props: Partial<Parameters<typeof SongItem>[0]> = {}) => {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <SongItem
      song={song}
      isOpen={openId === song.id}
      onOpen={setOpenId}
      {...props}
    />
  );
};

describe('Integration | Component | SongItem', () => {
  it('renders title and author', () => {
    renderClosed();

    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  describe('when the song details are toggled', () => {
    beforeEach(() => {
      render(<SongItemControlled />);
      fireEvent.click(screen.getByText('Test Song'));
    });

    it('displays the tab section and lyrics section', () => {
      expect(screen.getByText('Tablature')).toBeInTheDocument();
      expect(screen.getByText('Paroles', { selector: 'div' })).toBeInTheDocument();
      expect(screen.getByText('Paroles test')).toBeInTheDocument();
    });

    it('hides the tab section when clicking "Masquer la tablature"', () => {
      fireEvent.click(screen.getByText(/Masquer la tablature/));

      expect(screen.queryByAltText('Tablature')).not.toBeInTheDocument();
      expect(screen.getByText('Paroles', { selector: 'div' })).toBeInTheDocument();
    });

    it('hides the lyrics section when clicking "Masquer les paroles"', () => {
      fireEvent.click(screen.getByText(/Masquer les paroles/));

      expect(screen.queryByText('Paroles test')).not.toBeInTheDocument();
    });
  });

  describe('when the song has no tablature image', () => {
    it('does not render the tablature image', () => {
      const songNoTab = { ...song, tab: '' };

      render(<SongItemControlled song={songNoTab} />);
      fireEvent.click(screen.getByText('Test Song'));

      expect(screen.queryByAltText('Tablature')).not.toBeInTheDocument();
    });
  });

  describe('data-song-letter attribute', () => {
    it('uses the first letter of title when sortField is "title"', () => {
      const { container } = renderClosed({ sortField: 'title' });

      expect(container.querySelector('[data-song-letter="T"]')).toBeInTheDocument();
    });

    it('uses the first letter of author when sortField is "author"', () => {
      const { container } = renderClosed({ sortField: 'author' });

      expect(container.querySelector('[data-song-letter="T"]')).toBeInTheDocument();
    });
  });

  describe('admin edit feature', () => {
    it('does not show edit button when isAdmin is false', () => {
      const onEdit = jest.fn();
      renderClosed({ isAdmin: false, onEdit });

      expect(screen.queryByRole('button', { name: /Modifier la chanson/i })).not.toBeInTheDocument();
    });

    it('does not show edit button when onEdit is not provided', () => {
      renderClosed({ isAdmin: true });

      expect(screen.queryByRole('button', { name: /Modifier la chanson/i })).not.toBeInTheDocument();
    });

    it('calls onEdit with the song id when the edit button is clicked', () => {
      const onEdit = jest.fn();
      renderClosed({ isAdmin: true, onEdit });

      fireEvent.click(screen.getByRole('button', { name: /Modifier la chanson Test Song/i }));

      expect(onEdit).toHaveBeenCalledWith('1');
    });

    it('does not expand the card when the edit button is clicked', () => {
      const onEdit = jest.fn();
      render(<SongItemControlled isAdmin={true} onEdit={onEdit} />);

      fireEvent.click(screen.getByRole('button', { name: /Modifier la chanson Test Song/i }));

      expect(screen.queryByText('Tablature')).not.toBeInTheDocument();
    });
  });

  describe('lightbox', () => {
    it('opens the lightbox when clicking the loaded tab image', async () => {
      render(<SongItemControlled />);
      fireEvent.click(screen.getByText('Test Song'));

      const img = screen.getByAltText('Tablature');
      fireEvent.load(img);
      fireEvent.click(img);

      expect(screen.getByRole('dialog', { name: /Tablature en plein écran/i })).toBeInTheDocument();
    });

    it('closes the lightbox when clicking the close button', async () => {
      render(<SongItemControlled />);
      fireEvent.click(screen.getByText('Test Song'));

      const img = screen.getByAltText('Tablature');
      fireEvent.load(img);
      fireEvent.click(img);

      fireEvent.click(screen.getByRole('button', { name: /Fermer/i }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes the lightbox when clicking the backdrop', async () => {
      render(<SongItemControlled />);
      fireEvent.click(screen.getByText('Test Song'));

      const img = screen.getByAltText('Tablature');
      fireEvent.load(img);
      fireEvent.click(img);

      const dialog = screen.getByRole('dialog', { name: /Tablature en plein écran/i });
      fireEvent.click(dialog);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('admin delete feature', () => {
    it('does not show delete button when isAdmin is false', () => {
      const onDelete = jest.fn();
      renderClosed({ isAdmin: false, onDelete });

      expect(screen.queryByRole('button', { name: /Supprimer la chanson/i })).not.toBeInTheDocument();
    });

    it('does not show delete button when onDelete is not provided', () => {
      renderClosed({ isAdmin: true });

      expect(screen.queryByRole('button', { name: /Supprimer la chanson/i })).not.toBeInTheDocument();
    });

    it('shows delete button when isAdmin is true and onDelete is provided', () => {
      const onDelete = jest.fn();
      renderClosed({ isAdmin: true, onDelete });

      expect(screen.getByRole('button', { name: /Supprimer la chanson Test Song/i })).toBeInTheDocument();
    });

    it('shows inline confirmation when delete button is clicked', () => {
      const onDelete = jest.fn();
      renderClosed({ isAdmin: true, onDelete });

      fireEvent.click(screen.getByRole('button', { name: /Supprimer la chanson Test Song/i }));

      expect(screen.getByText('Supprimer cette chanson ?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirmer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
    });

    it('does not expand the card when the delete button is clicked', () => {
      const onDelete = jest.fn();
      render(<SongItemControlled isAdmin={true} onDelete={onDelete} />);

      fireEvent.click(screen.getByRole('button', { name: /Supprimer la chanson Test Song/i }));

      expect(screen.queryByText('Tablature')).not.toBeInTheDocument();
    });

    it('calls onDelete with the song id when confirmed', async () => {
      const onDelete = jest.fn().mockResolvedValue(undefined);
      renderClosed({ isAdmin: true, onDelete });

      fireEvent.click(screen.getByRole('button', { name: /Supprimer la chanson Test Song/i }));
      fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith('1');
      });
    });

    it('hides the confirmation and restores the delete button when cancel is clicked', () => {
      const onDelete = jest.fn();
      renderClosed({ isAdmin: true, onDelete });

      fireEvent.click(screen.getByRole('button', { name: /Supprimer la chanson Test Song/i }));
      fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));

      expect(screen.queryByText('Supprimer cette chanson ?')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Supprimer la chanson Test Song/i })).toBeInTheDocument();
    });
  });
});
