import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPlaylistsManagePage from './AdminPlaylistsManagePage';
import { AuthProvider } from '../contexts/AuthContext';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../api/playlists', () => ({
  fetchPlaylists: jest.fn(),
  createPlaylist: jest.fn(),
  renamePlaylist: jest.fn(),
  deletePlaylist: jest.fn(),
}));

const ADMIN_TOKEN =
  'header.' +
  btoa(JSON.stringify({ userId: 'user-1', email: 'admin@test.com', isAdmin: true })) +
  '.signature';

const mockPlaylists = [
  { name: 'Rock', songIds: [] },
  { name: 'Jazz', songIds: ['s1'] },
];

type PlaylistsMock = {
  fetchPlaylists: jest.Mock;
  createPlaylist: jest.Mock;
  renamePlaylist: jest.Mock;
  deletePlaylist: jest.Mock;
};

const getApiMocks = () => jest.requireMock('../api/playlists') as PlaylistsMock;

const renderAsAdmin = async () => {
  localStorage.setItem('dlg_token', ADMIN_TOKEN);
  localStorage.setItem('dlg_pseudo', 'admin');

  await act(async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminPlaylistsManagePage />
        </MemoryRouter>
      </AuthProvider>,
    );
  });
};

const renderAsGuest = async () => {
  localStorage.removeItem('dlg_token');

  await act(async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminPlaylistsManagePage />
        </MemoryRouter>
      </AuthProvider>,
    );
  });
};

describe('AdminPlaylistsManagePage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    const mocks = getApiMocks();
    mocks.fetchPlaylists.mockResolvedValue(mockPlaylists);
    mocks.createPlaylist.mockResolvedValue({ name: 'New Playlist', songIds: [] });
    mocks.renamePlaylist.mockResolvedValue({ name: 'Renamed', songIds: [] });
    mocks.deletePlaylist.mockResolvedValue(undefined);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('access control', () => {
    it('shows access denied message when user is not admin', async () => {
      await renderAsGuest();

      expect(screen.getByText('Accès réservé aux administrateurs.')).toBeInTheDocument();
    });

    it('renders the manage playlists page title for admin users', async () => {
      await renderAsAdmin();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Gérer les playlists' })).toBeInTheDocument();
      });
    });
  });

  describe('loading playlists', () => {
    it('calls fetchPlaylists with the admin token on mount', async () => {
      await renderAsAdmin();

      await waitFor(() => {
        expect(getApiMocks().fetchPlaylists).toHaveBeenCalledWith(ADMIN_TOKEN);
      });
    });

    it('displays all fetched playlists', async () => {
      await renderAsAdmin();

      await waitFor(() => {
        expect(screen.getByText('Rock')).toBeInTheDocument();
        expect(screen.getByText('Jazz')).toBeInTheDocument();
      });
    });

    it('shows empty state message when no playlists exist', async () => {
      getApiMocks().fetchPlaylists.mockResolvedValue([]);
      await renderAsAdmin();

      await waitFor(() => {
        expect(screen.getByText('Aucune playlist créée.')).toBeInTheDocument();
      });
    });

    it('shows an error message when fetchPlaylists fails', async () => {
      getApiMocks().fetchPlaylists.mockRejectedValue(new Error('Network error'));
      await renderAsAdmin();

      await waitFor(() => {
        expect(screen.getByText('Impossible de charger les playlists.')).toBeInTheDocument();
      });
    });
  });

  describe('creating a playlist', () => {
    it('renders the create input and button', async () => {
      await renderAsAdmin();

      expect(screen.getByRole('textbox', { name: 'Nom de la nouvelle playlist' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Créer' })).toBeInTheDocument();
    });

    it('keeps the create button disabled when the input is empty', async () => {
      await renderAsAdmin();

      expect(screen.getByRole('button', { name: 'Créer' })).toBeDisabled();
    });

    it('enables the create button when a name is typed', async () => {
      await renderAsAdmin();

      fireEvent.change(screen.getByRole('textbox', { name: 'Nom de la nouvelle playlist' }), {
        target: { value: 'Pop' },
      });

      expect(screen.getByRole('button', { name: 'Créer' })).not.toBeDisabled();
    });

    it('calls createPlaylist with trimmed name and token on form submit', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      fireEvent.change(screen.getByRole('textbox', { name: 'Nom de la nouvelle playlist' }), {
        target: { value: '  Pop  ' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

      await waitFor(() => {
        expect(getApiMocks().createPlaylist).toHaveBeenCalledWith('Pop', ADMIN_TOKEN);
      });
    });

    it('shows success message after creating a playlist', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      fireEvent.change(screen.getByRole('textbox', { name: 'Nom de la nouvelle playlist' }), {
        target: { value: 'Pop' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

      await waitFor(() => {
        expect(screen.getByText('Playlist créée avec succès.')).toBeInTheDocument();
      });
    });

    it('clears the input after creating a playlist', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      fireEvent.change(screen.getByRole('textbox', { name: 'Nom de la nouvelle playlist' }), {
        target: { value: 'Pop' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Nom de la nouvelle playlist' })).toHaveValue('');
      });
    });

    it('shows error message when createPlaylist fails', async () => {
      getApiMocks().createPlaylist.mockRejectedValue(new Error('Already exists'));
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      fireEvent.change(screen.getByRole('textbox', { name: 'Nom de la nouvelle playlist' }), {
        target: { value: 'Rock' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

      await waitFor(() => {
        expect(screen.getByText('Already exists')).toBeInTheDocument();
      });
    });
  });

  describe('deleting a playlist', () => {
    it('shows a delete button for each playlist', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const deleteButtons = screen.getAllByRole('button', { name: 'Supprimer la playlist' });
      expect(deleteButtons).toHaveLength(2);
    });

    it('shows confirmation controls when the delete button is clicked', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const deleteButtons = screen.getAllByRole('button', { name: 'Supprimer la playlist' });
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByRole('button', { name: 'Confirmer ?' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
    });

    it('hides the confirmation when the cancel button is clicked', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const deleteButtons = screen.getAllByRole('button', { name: 'Supprimer la playlist' });
      fireEvent.click(deleteButtons[0]);
      fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

      expect(screen.queryByRole('button', { name: 'Confirmer ?' })).not.toBeInTheDocument();
    });

    it('calls deletePlaylist with correct args when confirmed', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const deleteButtons = screen.getAllByRole('button', { name: 'Supprimer la playlist' });
      fireEvent.click(deleteButtons[0]);
      fireEvent.click(screen.getByRole('button', { name: 'Confirmer ?' }));

      await waitFor(() => {
        expect(getApiMocks().deletePlaylist).toHaveBeenCalledWith('Rock', ADMIN_TOKEN);
      });
    });

    it('shows success message after deleting a playlist', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const deleteButtons = screen.getAllByRole('button', { name: 'Supprimer la playlist' });
      fireEvent.click(deleteButtons[0]);
      fireEvent.click(screen.getByRole('button', { name: 'Confirmer ?' }));

      await waitFor(() => {
        expect(screen.getByText('Playlist "Rock" supprimée.')).toBeInTheDocument();
      });
    });

    it('shows error message when deletePlaylist fails', async () => {
      getApiMocks().deletePlaylist.mockRejectedValue(new Error('Delete failed'));
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const deleteButtons = screen.getAllByRole('button', { name: 'Supprimer la playlist' });
      fireEvent.click(deleteButtons[0]);
      fireEvent.click(screen.getByRole('button', { name: 'Confirmer ?' }));

      await waitFor(() => {
        expect(screen.getByText('Delete failed')).toBeInTheDocument();
      });
    });
  });

  describe('renaming a playlist', () => {
    it('shows a rename button for each playlist', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const renameButtons = screen.getAllByRole('button', { name: 'Renommer la playlist' });
      expect(renameButtons).toHaveLength(2);
    });

    it('shows the rename input when the rename button is clicked', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const renameButtons = screen.getAllByRole('button', { name: 'Renommer la playlist' });
      fireEvent.click(renameButtons[0]);

      expect(screen.getByRole('textbox', { name: 'Nouveau nom de la playlist' })).toBeInTheDocument();
    });

    it('hides the rename input when cancel is clicked', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const renameButtons = screen.getAllByRole('button', { name: 'Renommer la playlist' });
      fireEvent.click(renameButtons[0]);
      fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

      expect(screen.queryByRole('textbox', { name: 'Nouveau nom de la playlist' })).not.toBeInTheDocument();
    });

    it('calls renamePlaylist with correct args when confirmed', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const renameButtons = screen.getAllByRole('button', { name: 'Renommer la playlist' });
      fireEvent.click(renameButtons[0]);

      const input = screen.getByRole('textbox', { name: 'Nouveau nom de la playlist' });
      fireEvent.change(input, { target: { value: 'Heavy Metal' } });
      fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

      await waitFor(() => {
        expect(getApiMocks().renamePlaylist).toHaveBeenCalledWith('Rock', 'Heavy Metal', ADMIN_TOKEN);
      });
    });

    it('shows success message after renaming a playlist', async () => {
      getApiMocks().renamePlaylist.mockResolvedValue({ name: 'Heavy Metal', songIds: [] });
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const renameButtons = screen.getAllByRole('button', { name: 'Renommer la playlist' });
      fireEvent.click(renameButtons[0]);

      const input = screen.getByRole('textbox', { name: 'Nouveau nom de la playlist' });
      fireEvent.change(input, { target: { value: 'Heavy Metal' } });
      fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

      await waitFor(() => {
        expect(screen.getByText('Playlist renommée en "Heavy Metal".')).toBeInTheDocument();
      });
    });

    it('updates the playlist name in the list after successful rename', async () => {
      getApiMocks().renamePlaylist.mockResolvedValue({ name: 'Heavy Metal', songIds: [] });
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const renameButtons = screen.getAllByRole('button', { name: 'Renommer la playlist' });
      fireEvent.click(renameButtons[0]);

      const input = screen.getByRole('textbox', { name: 'Nouveau nom de la playlist' });
      fireEvent.change(input, { target: { value: 'Heavy Metal' } });
      fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

      await waitFor(() => {
        expect(screen.getByText('Heavy Metal')).toBeInTheDocument();
        expect(screen.queryByText('Rock')).not.toBeInTheDocument();
      });
    });

    it('shows error message when renamePlaylist fails', async () => {
      getApiMocks().renamePlaylist.mockRejectedValue(new Error('Rename failed'));
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const renameButtons = screen.getAllByRole('button', { name: 'Renommer la playlist' });
      fireEvent.click(renameButtons[0]);

      const input = screen.getByRole('textbox', { name: 'Nouveau nom de la playlist' });
      fireEvent.change(input, { target: { value: 'Heavy Metal' } });
      fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

      await waitFor(() => {
        expect(screen.getByText('Rename failed')).toBeInTheDocument();
      });
    });
  });

  describe('navigation', () => {
    it('renders a manage link for each playlist pointing to the correct route', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      const links = screen.getAllByRole('link', { name: 'Gérer la playlist' });
      expect(links[0]).toHaveAttribute('href', '/admin/playlists/Rock');
      expect(links[1]).toHaveAttribute('href', '/admin/playlists/Jazz');
    });

    it('calls navigate to / when the back button is clicked', async () => {
      await renderAsAdmin();
      await waitFor(() => screen.getByText('Rock'));

      fireEvent.click(screen.getByRole('button', { name: 'Retour' }));

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
