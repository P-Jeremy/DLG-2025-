import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddSongPage from './AddSongPage';
import { AuthProvider } from '../contexts/AuthContext';
import { SearchProvider } from '../contexts/SearchContext';

type GlobalWithFetch = typeof globalThis & { fetch: jest.Mock };

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@tiptap/react', () => {
  const { createElement } = jest.requireActual<typeof import('react')>('react');
  const chainMock = { focus: jest.fn(), toggleBold: jest.fn(), toggleItalic: jest.fn(), toggleStrike: jest.fn(), toggleBulletList: jest.fn(), toggleOrderedList: jest.fn(), undo: jest.fn(), redo: jest.fn(), run: jest.fn() };
  chainMock.focus.mockReturnValue(chainMock);
  chainMock.toggleBold.mockReturnValue(chainMock);
  chainMock.toggleItalic.mockReturnValue(chainMock);
  chainMock.toggleStrike.mockReturnValue(chainMock);
  chainMock.toggleBulletList.mockReturnValue(chainMock);
  chainMock.toggleOrderedList.mockReturnValue(chainMock);
  chainMock.undo.mockReturnValue(chainMock);
  chainMock.redo.mockReturnValue(chainMock);
  return {
    useEditor: () => ({
      getHTML: () => '<p>Test lyrics</p>',
      commands: { setContent: jest.fn() },
      isActive: jest.fn().mockReturnValue(false),
      chain: jest.fn().mockReturnValue(chainMock),
    }),
    EditorContent: ({ editor }: { editor: unknown }) =>
      createElement('div', { 'data-testid': 'tiptap-editor' }, String(editor)),
  };
});

const ADMIN_TOKEN =
  'header.' +
  btoa(JSON.stringify({ userId: 'user-1', email: 'admin@test.com', isAdmin: true })) +
  '.signature';

const renderAsAdmin = async () => {
  localStorage.setItem('dlg_token', ADMIN_TOKEN);
  localStorage.setItem('dlg_pseudo', 'admin');

  await act(async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <MemoryRouter>
            <AddSongPage />
          </MemoryRouter>
        </SearchProvider>
      </AuthProvider>,
    );
  });
};

const renderAsGuest = async () => {
  localStorage.clear();

  await act(async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <MemoryRouter>
            <AddSongPage />
          </MemoryRouter>
        </SearchProvider>
      </AuthProvider>,
    );
  });
};

function simulateFileInput(fileInput: HTMLElement, file: File) {
  fireEvent.change(fileInput, { target: { files: [file] } });
}

describe('AddSongPage', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
    jest.clearAllMocks();
  });

  it('shows forbidden message when user is not admin', async () => {
    await renderAsGuest();

    expect(screen.getByText('Accès réservé aux administrateurs.')).toBeInTheDocument();
  });

  it('renders the add song form for admins', async () => {
    await renderAsAdmin();

    expect(screen.getByRole('heading', { name: 'Ajouter une chanson' })).toBeInTheDocument();
    expect(screen.getByLabelText('Titre')).toBeInTheDocument();
    expect(screen.getByLabelText('Artiste')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajouter la chanson' })).toBeInTheDocument();
  });

  it('shows error when no file is selected on submit', async () => {
    await renderAsAdmin();

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'My Song' } });
    fireEvent.change(screen.getByLabelText('Artiste'), { target: { value: 'Artist' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Ajouter la chanson' }));
    });

    expect(screen.getByText('Veuillez sélectionner une image pour la tablature.')).toBeInTheDocument();
  });

  it('submits the form and shows success message on successful upload', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'new-id',
          title: 'My Song',
          author: 'Artist',
          lyrics: '<p>Test lyrics</p>',
          tab: 'https://s3.amazonaws.com/bucket/uuid.png',
        }),
    } as Response);

    await renderAsAdmin();

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'My Song' } });
    fireEvent.change(screen.getByLabelText('Artiste'), { target: { value: 'Artist' } });

    const file = new File(['image data'], 'tab.png', { type: 'image/png' });
    simulateFileInput(screen.getByLabelText(/Tablature/), file);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Ajouter la chanson' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Chanson ajoutée avec succès !')).toBeInTheDocument();
    });
  });

  it('shows error message when the API call fails', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Erreur serveur' }),
    } as Response);

    await renderAsAdmin();

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'My Song' } });
    fireEvent.change(screen.getByLabelText('Artiste'), { target: { value: 'Artist' } });

    const file = new File(['image data'], 'tab.png', { type: 'image/png' });
    simulateFileInput(screen.getByLabelText(/Tablature/), file);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Ajouter la chanson' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Erreur serveur')).toBeInTheDocument();
    });
  });

  it('disables submit button while loading', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockReturnValue(new Promise(() => undefined));

    await renderAsAdmin();

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'My Song' } });
    fireEvent.change(screen.getByLabelText('Artiste'), { target: { value: 'Artist' } });

    const file = new File(['image data'], 'tab.png', { type: 'image/png' });
    simulateFileInput(screen.getByLabelText(/Tablature/), file);

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter la chanson' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Envoi en cours...' })).toBeDisabled();
    });
  });
});
