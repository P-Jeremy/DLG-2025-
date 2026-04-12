import '@testing-library/jest-dom';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SongList from './SongList';
import NavbarSearch from './NavbarSearch/NavbarSearch';
import { AuthProvider } from '../contexts/AuthContext';
import { SearchProvider } from '../contexts/SearchContext';

const PLAYLISTS_API_PATH = '/api/playlists';

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

let broadcastOnMessage: (() => void) | null = null;
let mockBroadcastClose: jest.Mock;

function makeBroadcastChannelInstance() {
  mockBroadcastClose = jest.fn();
  broadcastOnMessage = null;
  const instance: { onmessage: (() => void) | null; close: jest.Mock } = {
    onmessage: null,
    close: mockBroadcastClose,
  };
  Object.defineProperty(instance, 'onmessage', {
    set(handler: () => void) { broadcastOnMessage = handler; },
    get() { return broadcastOnMessage; },
    configurable: true,
  });
  return instance;
}

const MockBroadcastChannel = jest.fn().mockImplementation(makeBroadcastChannelInstance);

(globalThis as typeof globalThis & { BroadcastChannel: unknown }).BroadcastChannel = MockBroadcastChannel;

const songsSortedByTitle = [
  { id: '2', title: 'Angie', author: 'Rolling Stones' },
  { id: '1', title: 'Bohemian Rhapsody', author: 'Queen' },
  { id: '3', title: 'Stairway to Heaven', author: 'Led Zeppelin' },
];

const getMockFetch = () => (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch;

const mockFetchReturning = (songs: typeof songsSortedByTitle) => {
  (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn((url: RequestInfo | URL) => {
    if (String(url).includes(PLAYLISTS_API_PATH)) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(songs) } as Response);
  });
};

describe('Integration | Component | SongList', () => {
  beforeEach(() => {
    MockBroadcastChannel.mockImplementation(makeBroadcastChannelInstance);
  });

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

      const fetchCalls = getMockFetch().mock.calls
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

  });

  describe('error cases', () => {
    it('displays the error message when fetch rejects', async () => {
      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn((url: RequestInfo | URL) => {
        if (String(url).includes(PLAYLISTS_API_PATH)) {
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
        if (String(url).includes(PLAYLISTS_API_PATH)) {
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
    it('shows the empty state message when the backend returns an empty array', async () => {
      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn((url: RequestInfo | URL) => {
        if (String(url).includes(PLAYLISTS_API_PATH)) {
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

    const mockFetchWithPlaylists = () => {
      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn((url: RequestInfo | URL) => {
        const urlStr = String(url);
        if (urlStr.includes(PLAYLISTS_API_PATH)) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(playlists) } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(songsSortedByTitle) } as Response);
      });
    };

    it('shows the vinyl loader briefly after selecting a playlist', async () => {
      jest.useFakeTimers();
      mockFetchWithPlaylists();

      renderSongList();

      await waitFor(() => expect(screen.getByText('Rock')).toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rock' } });

      expect(screen.getByAltText('Chargement...')).toBeInTheDocument();

      await act(async () => { jest.advanceTimersByTime(1000); });

      expect(screen.queryByAltText('Chargement...')).not.toBeInTheDocument();

      jest.useRealTimers();
    });

    it('displays songs in playlist order after selecting a playlist', async () => {
      jest.useFakeTimers();
      mockFetchWithPlaylists();

      renderSongList();

      await waitFor(() => expect(screen.getByText('Angie')).toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rock' } });

      await act(async () => { jest.advanceTimersByTime(1000); });

      const titles = screen.getAllByText(/Angie|Bohemian Rhapsody/);
      expect(titles[0]).toHaveTextContent('Bohemian Rhapsody');
      expect(titles[1]).toHaveTextContent('Angie');

      jest.useRealTimers();
    });

    it('restores full list when deselecting the playlist filter', async () => {
      jest.useFakeTimers();
      mockFetchWithPlaylists();

      renderSongList();

      await waitFor(() => expect(screen.getByText('Angie')).toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rock' } });

      await act(async () => { jest.advanceTimersByTime(1000); });

      expect(screen.queryByText('Stairway to Heaven')).not.toBeInTheDocument();

      fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });

      await act(async () => { jest.advanceTimersByTime(1000); });

      expect(screen.getByText('Stairway to Heaven')).toBeInTheDocument();

      jest.useRealTimers();
    });

    it('hides the alphabet nav when a playlist is selected', async () => {
      jest.useFakeTimers();
      mockFetchWithPlaylists();

      renderSongList();

      await waitFor(() => expect(screen.getByText('Angie')).toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rock' } });

      await act(async () => { jest.advanceTimersByTime(1000); });

      expect(screen.queryByRole('navigation', { name: 'Alphabet' })).not.toBeInTheDocument();

      jest.useRealTimers();
    });

    it('does not make a network request for the individual playlist when selecting a filter', async () => {
      jest.useFakeTimers();
      mockFetchWithPlaylists();

      renderSongList();

      await waitFor(() => expect(screen.getByText('Rock')).toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rock' } });

      await act(async () => { jest.advanceTimersByTime(1000); });

      const playlistDetailCalls = getMockFetch().mock.calls.filter(
        (call: unknown[]) => String(call[0]).includes(`${PLAYLISTS_API_PATH}/`),
      );
      expect(playlistDetailCalls).toHaveLength(0);

      jest.useRealTimers();
    });

    it('filters out unknown song ids and only shows songs present in the songs list', async () => {
      jest.useFakeTimers();
      const playlistsWithUnknownId = [{ name: 'Rock', songIds: ['1', '999'] }];
      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn((url: RequestInfo | URL) => {
        const urlStr = String(url);
        if (urlStr.includes(PLAYLISTS_API_PATH)) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(playlistsWithUnknownId) } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(songsSortedByTitle) } as Response);
      });

      renderSongList();

      await waitFor(() => expect(screen.getByText('Rock')).toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rock' } });

      await act(async () => { jest.advanceTimersByTime(1000); });

      expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument();
      expect(screen.queryByText('Angie')).not.toBeInTheDocument();
      expect(screen.queryByText('Stairway to Heaven')).not.toBeInTheDocument();

      jest.useRealTimers();
    });

    it('shows the empty state message when selecting a playlist with no songs', async () => {
      jest.useFakeTimers();
      const emptyPlaylist = [{ name: 'Vide', songIds: [] }];
      (globalThis as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn((url: RequestInfo | URL) => {
        const urlStr = String(url);
        if (urlStr.includes(PLAYLISTS_API_PATH)) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(emptyPlaylist) } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(songsSortedByTitle) } as Response);
      });

      renderSongList();

      await waitFor(() => expect(screen.getByText('Vide')).toBeInTheDocument());

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Vide' } });

      await act(async () => { jest.advanceTimersByTime(1000); });

      expect(screen.getByText('Aucune chanson trouvée.')).toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe('api cache update via BroadcastChannel', () => {
    beforeEach(() => {
      broadcastOnMessage = null;
      mockBroadcastClose.mockClear();
      MockBroadcastChannel.mockClear();
    });

    it('reloads songs when a message is received on the api-updates channel', async () => {
      mockFetchReturning(songsSortedByTitle);

      renderSongList();

      await waitFor(() => {
        expect(screen.getByText('Angie')).toBeInTheDocument();
      });

      const fetchCallsBefore = getMockFetch().mock.calls.filter(
        (call: unknown[]) => String(call[0]).includes('/api/songs?'),
      ).length;

      expect(broadcastOnMessage).not.toBeNull();
      await act(async () => { broadcastOnMessage!(); });

      await waitFor(() => {
        const fetchCallsAfter = getMockFetch().mock.calls.filter(
          (call: unknown[]) => String(call[0]).includes('/api/songs?'),
        ).length;
        expect(fetchCallsAfter).toBeGreaterThan(fetchCallsBefore);
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

});
