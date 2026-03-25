import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SongList from './SongList';

jest.mock('socket.io-client', () => ({
  io: () => ({
    on: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
  }),
}));

jest.mock('../api/tags', () => ({
  fetchTags: jest.fn().mockResolvedValue([]),
}));

beforeEach(() => {
  const { fetchTags } = jest.requireMock('../api/tags') as { fetchTags: jest.Mock };
  fetchTags.mockResolvedValue([]);
});

const songsSortedByTitle = [
  { id: '2', title: 'Angie', author: 'Rolling Stones' },
  { id: '1', title: 'Bohemian Rhapsody', author: 'Queen' },
  { id: '3', title: 'Stairway to Heaven', author: 'Led Zeppelin' },
];

const songsSortedByAuthor = [
  { id: '3', title: 'Stairway to Heaven', author: 'Led Zeppelin' },
  { id: '1', title: 'Bohemian Rhapsody', author: 'Queen' },
  { id: '2', title: 'Angie', author: 'Rolling Stones' },
];

const mockFetchReturning = (songs: typeof songsSortedByTitle) => {
  (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(songs),
  } as Response);
};

describe('Integration | Component | SongList', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('default sort', () => {
    it('calls the backend with sortBy=title by default', async () => {
      mockFetchReturning(songsSortedByTitle);

      render(<SongList />);

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      expect((globalThis as typeof globalThis & { fetch: jest.Mock }).fetch).toHaveBeenCalledWith('/api/songs?sortBy=title');
    });

    it('displays songs in the order returned by the backend (sorted by title)', async () => {
      mockFetchReturning(songsSortedByTitle);

      render(<SongList />);

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      const titles = screen.getAllByText(/Angie|Bohemian Rhapsody|Stairway to Heaven/);
      expect(titles[0]).toHaveTextContent('Angie');
      expect(titles[1]).toHaveTextContent('Bohemian Rhapsody');
      expect(titles[2]).toHaveTextContent('Stairway to Heaven');
    });

    it('displays the toggle unchecked (sort by title active) by default', async () => {
      mockFetchReturning(songsSortedByTitle);

      render(<SongList />);

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      expect(screen.getByRole('checkbox', { name: 'Trier par artiste' })).not.toBeChecked();
    });
  });

  describe('sort by artist', () => {
    it('calls the backend with sortBy=author after toggling', async () => {
      mockFetchReturning(songsSortedByTitle);

      render(<SongList />);

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      mockFetchReturning(songsSortedByAuthor);
      fireEvent.click(screen.getByText('Artiste'));

      await waitFor(() => {
        expect((globalThis as typeof globalThis & { fetch: jest.Mock }).fetch).toHaveBeenLastCalledWith('/api/songs?sortBy=author');
      });
    });

    it('displays songs in the order returned by the backend (sorted by artist)', async () => {
      mockFetchReturning(songsSortedByTitle);

      render(<SongList />);

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      mockFetchReturning(songsSortedByAuthor);
      fireEvent.click(screen.getByText('Artiste'));

      await waitFor(() => {
        const titles = screen.getAllByText(/Angie|Bohemian Rhapsody|Stairway to Heaven/);
        expect(titles[0]).toHaveTextContent('Stairway to Heaven');
        expect(titles[1]).toHaveTextContent('Bohemian Rhapsody');
        expect(titles[2]).toHaveTextContent('Angie');
      });
    });

    it('displays the toggle checked after selecting Artist', async () => {
      mockFetchReturning(songsSortedByTitle);

      render(<SongList />);

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      mockFetchReturning(songsSortedByAuthor);
      fireEvent.click(screen.getByText('Artiste'));

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: 'Trier par artiste' })).toBeChecked();
      });
    });
  });

  describe('error cases', () => {
    it('displays the error message when fetch rejects', async () => {
      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      render(<SongList />);

      await waitFor(() => {
        expect(screen.getByText('Erreur : Network error')).toBeInTheDocument();
      });
    });

    it('displays the error message when the HTTP response is an error', async () => {
      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve([]),
      } as Response);

      render(<SongList />);

      await waitFor(() => {
        expect(screen.getByText('Erreur : Erreur lors du chargement des chansons')).toBeInTheDocument();
      });
    });
  });

  describe('empty list', () => {
    it('displays "No songs found." when the backend returns an empty array', async () => {
      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      render(<SongList />);

      await waitFor(() => {
        expect(screen.getByText('Aucune chanson trouvée.')).toBeInTheDocument();
      });
    });
  });

  describe('back to sort by title', () => {
    it('calls the backend with sortBy=title after a second toggle back to Title', async () => {
      mockFetchReturning(songsSortedByTitle);

      render(<SongList />);

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      mockFetchReturning(songsSortedByAuthor);
      fireEvent.click(screen.getByText('Artiste'));

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: 'Trier par artiste' })).toBeChecked();
      });

      mockFetchReturning(songsSortedByTitle);
      fireEvent.click(screen.getByText('Titre'));

      await waitFor(() => {
        expect((globalThis as typeof globalThis & { fetch: jest.Mock }).fetch).toHaveBeenLastCalledWith('/api/songs?sortBy=title');
      });
    });
  });
});
