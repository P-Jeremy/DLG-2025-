import '@testing-library/jest-dom';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SongList from './SongList';
import NavbarSearch from './NavbarSearch/NavbarSearch';
import { AuthProvider } from '../contexts/AuthContext';
import { SearchProvider } from '../contexts/SearchContext';

const renderSongList = () => render(
  <MemoryRouter>
    <AuthProvider>
      <SearchProvider>
        <NavbarSearch />
        <SongList />
      </SearchProvider>
    </AuthProvider>
  </MemoryRouter>,
);

jest.mock('socket.io-client', () => ({
  io: () => ({
    on: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
  }),
}));

const songsSortedByTitle = [
  { id: '2', title: 'Angie', author: 'Rolling Stones' },
  { id: '1', title: 'Bohemian Rhapsody', author: 'Queen' },
  { id: '3', title: 'Stairway to Heaven', author: 'Led Zeppelin' },
];


const mockFetchReturning = (songs: typeof songsSortedByTitle) => {
  (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn((url: RequestInfo | URL) => {
    if (String(url).includes('/api/playlists')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(songs) } as Response);
  });
};

describe('Integration | Component | SongList', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('default sort', () => {
    it('fetches songs once on mount', async () => {
      mockFetchReturning(songsSortedByTitle);

      renderSongList();

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      const fetchCalls = (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch.mock.calls
        .filter((call: unknown[]) => String(call[0]).includes('/api/songs?'));
      expect(fetchCalls).toHaveLength(1);
      expect(fetchCalls[0][0]).toBe('/api/songs?sortBy=title');
    });

    it('displays songs sorted by title by default', async () => {
      mockFetchReturning(songsSortedByTitle);

      renderSongList();

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

      renderSongList();

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      expect(screen.getByRole('checkbox', { name: 'Trier par artiste' })).not.toBeChecked();
    });
  });

  describe('sort by artist', () => {
    it('sorts songs by author on the frontend without refetching', async () => {
      mockFetchReturning(songsSortedByTitle);

      renderSongList();

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      const fetchCallsBefore = (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch.mock.calls
        .filter((call: unknown[]) => String(call[0]).includes('/api/songs?')).length;

      fireEvent.click(screen.getByLabelText('Sort by artist'));

      await waitFor(() => {
        const titles = screen.getAllByText(/Angie|Bohemian Rhapsody|Stairway to Heaven/);
        expect(titles[0]).toHaveTextContent('Stairway to Heaven');
        expect(titles[1]).toHaveTextContent('Bohemian Rhapsody');
        expect(titles[2]).toHaveTextContent('Angie');
      });

      const fetchCallsAfter = (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch.mock.calls
        .filter((call: unknown[]) => String(call[0]).includes('/api/songs?')).length;
      expect(fetchCallsAfter).toBe(fetchCallsBefore);
    });

    it('displays the toggle checked after selecting Artist', async () => {
      mockFetchReturning(songsSortedByTitle);

      renderSongList();

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Sort by artist'));

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: 'Trier par artiste' })).toBeChecked();
      });
    });
  });

  describe('error cases', () => {
    it('displays the error message when fetch rejects', async () => {
      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn((url: RequestInfo | URL) => {
        if (String(url).includes('/api/playlists')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
        }
        return Promise.reject(new Error('Network error'));
      });

      renderSongList();

      await waitFor(() => {
        expect(screen.getByText('Erreur : Network error')).toBeInTheDocument();
      });
    });

    it('displays the error message when the HTTP response is an error', async () => {
      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn((url: RequestInfo | URL) => {
        if (String(url).includes('/api/playlists')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
        }
        return Promise.resolve({ ok: false, json: () => Promise.resolve([]) } as Response);
      });

      renderSongList();

      await waitFor(() => {
        expect(screen.getByText('Erreur : Erreur lors du chargement des chansons')).toBeInTheDocument();
      });
    });
  });

  describe('empty list', () => {
    it('displays "No songs found." when the backend returns an empty array', async () => {
      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn((url: RequestInfo | URL) => {
        if (String(url).includes('/api/playlists')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
      });

      renderSongList();

      await waitFor(() => {
        expect(screen.getByText('Aucune chanson trouvée.')).toBeInTheDocument();
      });
    });
  });

  describe('playlist filter', () => {
    const playlists = [{ name: 'Rock', songIds: ['1', '2'] }];
    const playlistData = { playlist: { name: 'Rock', songIds: ['1', '2'] }, songs: [] };

    const mockFetchWithPlaylists = () => {
      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn((url: RequestInfo | URL) => {
        const urlStr = String(url);
        if (urlStr.includes('/api/playlists/')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(playlistData) } as Response);
        }
        if (urlStr.includes('/api/playlists')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(playlists) } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(songsSortedByTitle) } as Response);
      });
    };

    it('shows the vinyl loader while the playlist fetch is in flight', async () => {
      let resolvePlaylist!: (value: Response) => void;
      const playlistPromise = new Promise<Response>((resolve) => { resolvePlaylist = resolve; });

      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn((url: RequestInfo | URL) => {
        const urlStr = String(url);
        if (urlStr.includes('/api/playlists/')) return playlistPromise;
        if (urlStr.includes('/api/playlists')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(playlists) } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(songsSortedByTitle) } as Response);
      });

      renderSongList();

      await waitFor(() => expect(screen.getByText('Rock')).toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rock' } });

      expect(screen.getByAltText('Chargement...')).toBeInTheDocument();

      await act(async () => {
        resolvePlaylist({ ok: true, json: () => Promise.resolve(playlistData) } as Response);
      });
    });

    it('displays songs in playlist order after selecting a playlist', async () => {
      mockFetchWithPlaylists();

      renderSongList();

      await waitFor(() => expect(screen.getByText('Angie')).toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rock' } });

      await waitFor(() => {
        const titles = screen.getAllByText(/Angie|Bohemian Rhapsody/);
        expect(titles[0]).toHaveTextContent('Bohemian Rhapsody');
        expect(titles[1]).toHaveTextContent('Angie');
      });
    });

    it('restores full list when deselecting the playlist filter', async () => {
      mockFetchWithPlaylists();

      renderSongList();

      await waitFor(() => expect(screen.getByText('Angie')).toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rock' } });

      await waitFor(() => expect(screen.queryByText('Stairway to Heaven')).not.toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });

      await waitFor(() => expect(screen.getByText('Stairway to Heaven')).toBeInTheDocument());
    });

    it('hides the alphabet nav when a playlist is selected', async () => {
      mockFetchWithPlaylists();

      renderSongList();

      await waitFor(() => expect(screen.getByText('Angie')).toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rock' } });

      await waitFor(() => expect(screen.queryByRole('navigation', { name: 'Alphabet' })).not.toBeInTheDocument());
    });

    it('displays error message when the playlist fetch fails', async () => {
      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn((url: RequestInfo | URL) => {
        const urlStr = String(url);
        if (urlStr.includes('/api/playlists/')) {
          return Promise.reject(new Error('Playlist network error'));
        }
        if (urlStr.includes('/api/playlists')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(playlists) } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(songsSortedByTitle) } as Response);
      });

      renderSongList();

      await waitFor(() => expect(screen.getByText('Angie')).toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rock' } });

      await waitFor(() => {
        expect(screen.getByText('Erreur : Playlist network error')).toBeInTheDocument();
      });
    });
  });

  describe('shuffle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockFetchReturning(songsSortedByTitle);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('shows the vinyl loader for 1 second after clicking the shuffle button', async () => {
      renderSongList();

      await waitFor(() => expect(screen.getByText('Angie')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: 'Chanson au hasard' }));

      expect(screen.getByAltText('Chargement...')).toBeInTheDocument();

      await act(async () => { jest.advanceTimersByTime(1000); });

      expect(screen.queryByAltText('Chargement...')).not.toBeInTheDocument();
    });

    it('displays a single song and a cancel button after the shuffle delay', async () => {
      renderSongList();

      await waitFor(() => expect(screen.getByText('Angie')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: 'Chanson au hasard' }));

      await act(async () => { jest.advanceTimersByTime(1000); });

      const visibleTitles = screen.getAllByText(/Angie|Bohemian Rhapsody|Stairway to Heaven/);
      expect(visibleTitles).toHaveLength(1);
      expect(screen.getByRole('button', { name: 'Retour à la liste' })).toBeInTheDocument();
    });

    it('hides the controls card when shuffle is active', async () => {
      renderSongList();

      await waitFor(() => expect(screen.getByText('Angie')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: 'Chanson au hasard' }));

      await act(async () => { jest.advanceTimersByTime(1000); });

      expect(screen.queryByText('Retour à la liste')).toBeInTheDocument();
    });

    it('restores the full list after clicking "Retour à la liste"', async () => {
      renderSongList();

      await waitFor(() => expect(screen.getByText('Angie')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: 'Chanson au hasard' }));

      await act(async () => { jest.advanceTimersByTime(1000); });

      fireEvent.click(screen.getByRole('button', { name: 'Retour à la liste' }));

      await act(async () => { jest.advanceTimersByTime(1000); });

      expect(screen.getAllByText(/Angie|Bohemian Rhapsody|Stairway to Heaven/)).toHaveLength(3);
      expect(screen.queryByRole('button', { name: 'Retour à la liste' })).not.toBeInTheDocument();
    });
  });

  describe('back to sort by title', () => {
    it('re-sorts by title on the frontend after toggling back', async () => {
      mockFetchReturning(songsSortedByTitle);

      renderSongList();

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Sort by artist'));

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: 'Trier par artiste' })).toBeChecked();
      });

      fireEvent.click(screen.getByLabelText('Sort by title'));

      await waitFor(() => {
        const titles = screen.getAllByText(/Angie|Bohemian Rhapsody|Stairway to Heaven/);
        expect(titles[0]).toHaveTextContent('Angie');
        expect(titles[1]).toHaveTextContent('Bohemian Rhapsody');
        expect(titles[2]).toHaveTextContent('Stairway to Heaven');
      });
    });
  });
});
