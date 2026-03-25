import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SongItem from './SongItem';
import type { Song } from '../types/song';

const song: Song = {
  id: '1',
  title: 'Test Song',
  author: 'Test Author',
  lyrics: '<b>Paroles test</b>',
  tab: 'https://example.com/tab.png',
  tags: [{ id: 't1', name: 'Rock' }]
};

describe('Integration | Component | SongItem', () => {
  it('renders title, author and tags', () => {
    // given
    render(<SongItem song={song} />);

    // then
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Rock')).toBeInTheDocument();
  });

  describe('when the song details are toggled', () => {
    beforeEach(() => {
      // given
      render(<SongItem song={song} />);
      // when
      fireEvent.click(screen.getByText('Test Song'));
    });

    it('displays the tab section and lyrics section', () => {
      // then
      expect(screen.getByText('Tablature')).toBeInTheDocument();
      expect(screen.getByText('Paroles', { selector: 'div' })).toBeInTheDocument();
      expect(screen.getByText('Paroles test')).toBeInTheDocument();
    });

    it('hides the tab section when clicking "Masquer la tablature"', () => {
      // when
      fireEvent.click(screen.getByText(/Masquer la tablature/));

      // then
      expect(screen.queryByAltText('Tablature')).not.toBeInTheDocument();
      expect(screen.getByText('Paroles', { selector: 'div' })).toBeInTheDocument();
    });

    it('hides the lyrics section when clicking "Masquer les paroles"', () => {
      // when
      fireEvent.click(screen.getByText(/Masquer les paroles/));

      // then
      expect(screen.queryByText('Paroles test')).not.toBeInTheDocument();
    });
  });

  describe('when the song has no tablature image', () => {
    it('does not render the tablature image', () => {
      // given
      const songNoTab = { ...song, tab: '' };

      // when
      render(<SongItem song={songNoTab} />);
      fireEvent.click(screen.getByText('Test Song'));

      // then
      expect(screen.queryByAltText('Tablature')).not.toBeInTheDocument();
    });
  });

  describe('admin delete feature', () => {
    it('does not show delete button when isAdmin is false', () => {
      // given
      const onDelete = jest.fn();
      render(<SongItem song={song} isAdmin={false} onDelete={onDelete} />);

      // then
      expect(screen.queryByRole('button', { name: /Supprimer la chanson/i })).not.toBeInTheDocument();
    });

    it('does not show delete button when onDelete is not provided', () => {
      // given
      render(<SongItem song={song} isAdmin={true} />);

      // then
      expect(screen.queryByRole('button', { name: /Supprimer la chanson/i })).not.toBeInTheDocument();
    });

    it('shows delete button when isAdmin is true and onDelete is provided', () => {
      // given
      const onDelete = jest.fn();
      render(<SongItem song={song} isAdmin={true} onDelete={onDelete} />);

      // then
      expect(screen.getByRole('button', { name: /Supprimer la chanson Test Song/i })).toBeInTheDocument();
    });

    it('shows inline confirmation when delete button is clicked', () => {
      // given
      const onDelete = jest.fn();
      render(<SongItem song={song} isAdmin={true} onDelete={onDelete} />);

      // when
      fireEvent.click(screen.getByRole('button', { name: /Supprimer la chanson Test Song/i }));

      // then
      expect(screen.getByText('Supprimer cette chanson ?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirmer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
    });

    it('does not expand the card when the delete button is clicked', () => {
      // given
      const onDelete = jest.fn();
      render(<SongItem song={song} isAdmin={true} onDelete={onDelete} />);

      // when
      fireEvent.click(screen.getByRole('button', { name: /Supprimer la chanson Test Song/i }));

      // then
      expect(screen.queryByText('Tablature')).not.toBeInTheDocument();
    });

    it('calls onDelete with the song id when confirmed', async () => {
      // given
      const onDelete = jest.fn().mockResolvedValue(undefined);
      render(<SongItem song={song} isAdmin={true} onDelete={onDelete} />);

      // when
      fireEvent.click(screen.getByRole('button', { name: /Supprimer la chanson Test Song/i }));
      fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

      // then
      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith('1');
      });
    });

    it('hides the confirmation and restores the delete button when cancel is clicked', () => {
      // given
      const onDelete = jest.fn();
      render(<SongItem song={song} isAdmin={true} onDelete={onDelete} />);

      // when
      fireEvent.click(screen.getByRole('button', { name: /Supprimer la chanson Test Song/i }));
      fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));

      // then
      expect(screen.queryByText('Supprimer cette chanson ?')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Supprimer la chanson Test Song/i })).toBeInTheDocument();
    });
  });
});
