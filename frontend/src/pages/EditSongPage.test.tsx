import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EditSongPage from './EditSongPage';
import { AuthProvider } from '../contexts/AuthContext';

const SONG_ID = 'song-abc-123';

const mockSong = {
  id: SONG_ID,
  title: 'Ma Chanson',
  author: 'Mon Artiste',
  lyrics: '<p>Paroles existantes</p>',
  tab: 'https://s3.amazonaws.com/bucket/tab.png',
};

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@tiptap/react', () => {
  const { createElement } = jest.requireActual<typeof import('react')>('react');
  const chainMock = {
    focus: jest.fn(),
    toggleBold: jest.fn(),
    toggleItalic: jest.fn(),
    toggleStrike: jest.fn(),
    toggleBulletList: jest.fn(),
    toggleOrderedList: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    run: jest.fn(),
  };
  Object.values(chainMock).forEach((fn) => {
    if (typeof fn === 'function') (fn as jest.Mock).mockReturnValue(chainMock);
  });
  return {
    useEditor: () => ({
      getHTML: () => '<p>Paroles existantes</p>',
      commands: { setContent: jest.fn() },
      isActive: jest.fn().mockReturnValue(false),
      chain: jest.fn().mockReturnValue(chainMock),
    }),
    EditorContent: ({ editor }: { editor: unknown }) =>
      createElement('div', { 'data-testid': 'tiptap-editor' }, String(editor)),
  };
});

jest.mock('../api/songs', () => ({
  fetchSongs: jest.fn().mockResolvedValue([
    {
      id: 'song-abc-123',
      title: 'Ma Chanson',
      author: 'Mon Artiste',
      lyrics: '<p>Paroles existantes</p>',
      tab: 'https://s3.amazonaws.com/bucket/tab.png',
    },
  ]),
  updateSong: jest.fn().mockResolvedValue({
    id: 'song-abc-123',
    title: 'Ma Chanson Modifiée',
    author: 'Mon Artiste',
    lyrics: '<p>Paroles existantes</p>',
    tab: 'https://s3.amazonaws.com/bucket/tab.png',
  }),
}));

const ADMIN_TOKEN =
  'header.' +
  btoa(JSON.stringify({ userId: 'user-1', email: 'admin@test.com', isAdmin: true })) +
  '.signature';

const renderAsAdmin = async (songId = SONG_ID) => {
  localStorage.setItem('dlg_token', ADMIN_TOKEN);
  localStorage.setItem('dlg_pseudo', 'admin');

  await act(async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[`/songs/${songId}/edit`]}>
          <Routes>
            <Route path="/songs/:id/edit" element={<EditSongPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
  });
};

const renderAsGuest = async () => {
  localStorage.clear();

  await act(async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[`/songs/${SONG_ID}/edit`]}>
          <Routes>
            <Route path="/songs/:id/edit" element={<EditSongPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
  });
};

describe('EditSongPage', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
    jest.clearAllMocks();

    const { fetchSongs, updateSong } = jest.requireMock('../api/songs') as {
      fetchSongs: jest.Mock;
      updateSong: jest.Mock;
    };
    fetchSongs.mockResolvedValue([mockSong]);
    updateSong.mockResolvedValue({ ...mockSong, title: 'Ma Chanson Modifiée' });
  });

  it('shows forbidden message when user is not admin', async () => {
    await renderAsGuest();

    expect(screen.getByText('Accès réservé aux administrateurs.')).toBeInTheDocument();
  });

  it('renders the edit form pre-filled with existing song data for admins', async () => {
    await renderAsAdmin();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Modifier une chanson' })).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText('Titre') as HTMLInputElement;
    expect(titleInput.value).toBe('Ma Chanson');

    const authorInput = screen.getByLabelText('Artiste') as HTMLInputElement;
    expect(authorInput.value).toBe('Mon Artiste');
  });

  it('shows not found message when song id does not match any song', async () => {
    const { fetchSongs } = jest.requireMock('../api/songs') as { fetchSongs: jest.Mock };
    fetchSongs.mockResolvedValue([]);

    await renderAsAdmin('nonexistent-id');

    await waitFor(() => {
      expect(screen.getByText('Chanson introuvable.')).toBeInTheDocument();
    });
  });

  it('shows title required error when submitting with empty title', async () => {
    await renderAsAdmin();

    await waitFor(() => screen.getByLabelText('Titre'));

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: '' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }));
    });

    expect(screen.getByText('Le titre est requis.')).toBeInTheDocument();
  });

  it('submits the form and shows success message on successful update', async () => {
    await renderAsAdmin();

    await waitFor(() => screen.getByLabelText('Titre'));

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Ma Chanson Modifiée' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Chanson modifiée avec succès !')).toBeInTheDocument();
    });
  });

  it('shows error message when the API call fails', async () => {
    const { updateSong } = jest.requireMock('../api/songs') as { updateSong: jest.Mock };
    updateSong.mockRejectedValue(new Error('Erreur serveur'));

    await renderAsAdmin();

    await waitFor(() => screen.getByLabelText('Titre'));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Erreur serveur')).toBeInTheDocument();
    });
  });

  it('disables submit button while loading', async () => {
    const { updateSong } = jest.requireMock('../api/songs') as { updateSong: jest.Mock };
    updateSong.mockReturnValue(new Promise(() => undefined));

    await renderAsAdmin();

    await waitFor(() => screen.getByLabelText('Titre'));

    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Enregistrement…' })).toBeDisabled();
    });
  });

  it('displays the current tab image when song has a tab', async () => {
    await renderAsAdmin();

    await waitFor(() => {
      const tabImg = screen.getByAltText('Tablature actuelle') as HTMLImageElement;
      expect(tabImg).toBeInTheDocument();
      expect(tabImg.src).toBe('https://s3.amazonaws.com/bucket/tab.png');
    });
  });
});
