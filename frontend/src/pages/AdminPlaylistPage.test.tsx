import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminPlaylistPage from './AdminPlaylistPage';
import { AuthProvider } from '../contexts/AuthContext';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../api/playlists', () => ({
  fetchPlaylist: jest.fn(),
  reorderPlaylist: jest.fn(),
  addSongToPlaylist: jest.fn(),
}));

jest.mock('../api/songs', () => ({
  fetchSongs: jest.fn(),
}));

const mockPlaylistData = {
  playlist: { id: 'pl-1', tagId: 'tag-1', songIds: ['song-2', 'song-1'] },
  songs: [
    { id: 'song-2', title: 'Beta', author: 'Artist B' },
    { id: 'song-1', title: 'Alpha', author: 'Artist A' },
  ],
};

const mockAllSongs = [
  { id: 'song-1', title: 'Alpha', author: 'Artist A' },
  { id: 'song-2', title: 'Beta', author: 'Artist B' },
  { id: 'song-3', title: 'Gamma', author: 'Artist C' },
];

const renderAsAdmin = async (tagId = 'tag-1') => {
  localStorage.setItem('dlg_token', 'test-admin-token');
  localStorage.setItem('dlg_is_admin', 'true');
  localStorage.setItem('dlg_pseudo', 'admin');

  await act(async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[`/admin/playlists/${tagId}`]}>
          <Routes>
            <Route path="/admin/playlists/:tagId" element={<AdminPlaylistPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
  });
};

describe('AdminPlaylistPage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    const mocks = jest.requireMock('../api/playlists') as {
      fetchPlaylist: jest.Mock;
      reorderPlaylist: jest.Mock;
      addSongToPlaylist: jest.Mock;
    };
    mocks.fetchPlaylist.mockResolvedValue(mockPlaylistData);
    mocks.reorderPlaylist.mockResolvedValue({ id: 'pl-1', tagId: 'tag-1', songIds: ['song-1', 'song-2'] });
    mocks.addSongToPlaylist.mockResolvedValue({ id: 'pl-1', tagId: 'tag-1', songIds: ['song-2', 'song-1', 'song-3'] });

    const songMocks = jest.requireMock('../api/songs') as { fetchSongs: jest.Mock };
    songMocks.fetchSongs.mockResolvedValue(mockAllSongs);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('shows access denied message for non-admin users', async () => {
    localStorage.removeItem('dlg_token');
    localStorage.removeItem('dlg_is_admin');

    await act(async () => {
      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/admin/playlists/tag-1']}>
            <Routes>
              <Route path="/admin/playlists/:tagId" element={<AdminPlaylistPage />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>,
      );
    });

    expect(screen.getByText('Accès réservé aux administrateurs.')).toBeInTheDocument();
  });

  it('displays songs in playlist order', async () => {
    await renderAsAdmin();

    await waitFor(() => {
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    const titles = screen.getAllByText(/Beta|Alpha/);
    expect(titles[0]).toHaveTextContent('Beta');
    expect(titles[1]).toHaveTextContent('Alpha');
  });

  it('moves a song up when the up button is clicked', async () => {
    await renderAsAdmin();

    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());

    const upButtons = screen.getAllByRole('button', { name: 'Monter' });
    fireEvent.click(upButtons[1]);

    const titles = screen.getAllByText(/Beta|Alpha/);
    expect(titles[0]).toHaveTextContent('Alpha');
    expect(titles[1]).toHaveTextContent('Beta');
  });

  it('calls reorderPlaylist with correct song order when save is clicked', async () => {
    await renderAsAdmin();
    const { reorderPlaylist } = jest.requireMock('../api/playlists') as { reorderPlaylist: jest.Mock };

    await waitFor(() => expect(screen.getByText('Beta')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Sauvegarder' }));

    await waitFor(() => {
      expect(reorderPlaylist).toHaveBeenCalledWith(
        'tag-1',
        ['song-2', 'song-1'],
        'test-admin-token',
      );
    });
  });

  it('shows success message after saving', async () => {
    await renderAsAdmin();

    await waitFor(() => expect(screen.getByText('Beta')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Sauvegarder' }));

    await waitFor(() => {
      expect(screen.getByText('Playlist sauvegardée avec succès.')).toBeInTheDocument();
    });
  });

  it('shows song search input', async () => {
    await renderAsAdmin();

    await waitFor(() => expect(screen.getByText('Beta')).toBeInTheDocument());

    expect(screen.getByRole('textbox', { name: 'Rechercher une chanson à ajouter' })).toBeInTheDocument();
  });

  it('filters songs not in playlist when typing in search', async () => {
    await renderAsAdmin();

    await waitFor(() => expect(screen.getByText('Beta')).toBeInTheDocument());

    const searchInput = screen.getByRole('textbox', { name: 'Rechercher une chanson à ajouter' });
    fireEvent.change(searchInput, { target: { value: 'Gamma' } });

    await waitFor(() => {
      expect(screen.getByText('Gamma')).toBeInTheDocument();
    });
  });

  it('calls addSongToPlaylist when a search result is clicked', async () => {
    await renderAsAdmin();
    const { addSongToPlaylist } = jest.requireMock('../api/playlists') as { addSongToPlaylist: jest.Mock };

    await waitFor(() => expect(screen.getByText('Beta')).toBeInTheDocument());

    const searchInput = screen.getByRole('textbox', { name: 'Rechercher une chanson à ajouter' });
    fireEvent.change(searchInput, { target: { value: 'Gamma' } });

    await waitFor(() => screen.getByText('Gamma'));

    fireEvent.click(screen.getByText('Gamma'));

    await waitFor(() => {
      expect(addSongToPlaylist).toHaveBeenCalledWith('tag-1', 'song-3', 'test-admin-token');
    });
  });
});
