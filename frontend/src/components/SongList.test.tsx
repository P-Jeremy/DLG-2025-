import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SongList from './SongList';
import { AuthProvider } from '../contexts/AuthContext';

const renderSongList = () => render(
  <MemoryRouter>
    <AuthProvider>
      <SongList />
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

const songsSortedByAuthor = [
  { id: '3', title: 'Stairway to Heaven', author: 'Led Zeppelin' },
  { id: '1', title: 'Bohemian Rhapsody', author: 'Queen' },
  { id: '2', title: 'Angie', author: 'Rolling Stones' },
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
    it('calls the backend with sortBy=title by default', async () => {
      mockFetchReturning(songsSortedByTitle);

      renderSongList();

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      expect((globalThis as typeof globalThis & { fetch: jest.Mock }).fetch).toHaveBeenCalledWith('/api/songs?sortBy=title');
    });

    it('displays songs in the order returned by the backend (sorted by title)', async () => {
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
    it('calls the backend with sortBy=author after toggling', async () => {
      mockFetchReturning(songsSortedByTitle);

      renderSongList();

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      mockFetchReturning(songsSortedByAuthor);
      fireEvent.click(screen.getByText('Artiste'));

      await waitFor(() => {
        expect((globalThis as typeof globalThis & { fetch: jest.Mock }).fetch).toHaveBeenCalledWith('/api/songs?sortBy=author');
      });
    });

    it('displays songs in the order returned by the backend (sorted by artist)', async () => {
      mockFetchReturning(songsSortedByTitle);

      renderSongList();

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

      renderSongList();

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

      resolvePlaylist({ ok: true, json: () => Promise.resolve(playlistData) } as Response);
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

    it('hides the sort toggle when a playlist is selected', async () => {
      mockFetchWithPlaylists();

      renderSongList();

      await waitFor(() => expect(screen.getByText('Angie')).toBeInTheDocument());

      expect(screen.getByRole('checkbox', { name: 'Trier par artiste' })).toBeInTheDocument();

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rock' } });

      await waitFor(() => expect(screen.queryByRole('checkbox', { name: 'Trier par artiste' })).not.toBeInTheDocument());
    });

    it('restores the sort toggle when deselecting the playlist filter', async () => {
      mockFetchWithPlaylists();

      renderSongList();

      await waitFor(() => expect(screen.getByText('Angie')).toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rock' } });

      await waitFor(() => expect(screen.queryByRole('checkbox', { name: 'Trier par artiste' })).not.toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });

      await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Trier par artiste' })).toBeInTheDocument());
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

  describe('back to sort by title', () => {
    it('calls the backend with sortBy=title after a second toggle back to Title', async () => {
      mockFetchReturning(songsSortedByTitle);

      renderSongList();

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
        expect((globalThis as typeof globalThis & { fetch: jest.Mock }).fetch).toHaveBeenCalledWith('/api/songs?sortBy=title');
      });
    });
  });
});
