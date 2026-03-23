import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import SongItem from './SongItem';
import type { Song } from './SongList';

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
});
