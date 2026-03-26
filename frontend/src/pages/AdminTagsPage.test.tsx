import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminTagsPage from './AdminTagsPage';
import { AuthProvider } from '../contexts/AuthContext';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../api/tags', () => ({
  fetchTags: jest.fn().mockResolvedValue([
    { id: 'tag-1', name: 'rock' },
    { id: 'tag-2', name: 'pop' },
  ]),
  createTag: jest.fn().mockResolvedValue({ id: 'tag-3', name: 'jazz' }),
  deleteTag: jest.fn().mockResolvedValue(undefined),
  renameTag: jest.fn().mockResolvedValue({ id: 'tag-1', name: 'metal' }),
}));

const renderAsAdmin = async () => {
  localStorage.setItem('dlg_token', 'test-admin-token');
  localStorage.setItem('dlg_is_admin', 'true');
  localStorage.setItem('dlg_pseudo', 'admin');

  await act(async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminTagsPage />
        </MemoryRouter>
      </AuthProvider>,
    );
  });
};

const renderAsGuest = async () => {
  localStorage.removeItem('dlg_token');
  localStorage.removeItem('dlg_is_admin');

  await act(async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminTagsPage />
        </MemoryRouter>
      </AuthProvider>,
    );
  });
};

describe('AdminTagsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    const { fetchTags } = jest.requireMock('../api/tags') as { fetchTags: jest.Mock };
    fetchTags.mockResolvedValue([
      { id: 'tag-1', name: 'rock' },
      { id: 'tag-2', name: 'pop' },
    ]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('shows access denied message for non-admin users', async () => {
    await renderAsGuest();

    expect(screen.getByText('Accès réservé aux administrateurs.')).toBeInTheDocument();
  });

  it('displays existing tags for admin', async () => {
    await renderAsAdmin();

    await waitFor(() => {
      expect(screen.getByText('rock')).toBeInTheDocument();
      expect(screen.getByText('pop')).toBeInTheDocument();
    });
  });

  it('shows create form for admin', async () => {
    await renderAsAdmin();

    expect(screen.getByRole('textbox', { name: 'Nom du nouveau tag' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Créer' })).toBeInTheDocument();
  });

  it('calls createTag with the entered name when form is submitted', async () => {
    await renderAsAdmin();
    const { createTag } = jest.requireMock('../api/tags') as { createTag: jest.Mock };

    await waitFor(() => expect(screen.getByText('rock')).toBeInTheDocument());

    fireEvent.change(screen.getByRole('textbox', { name: 'Nom du nouveau tag' }), {
      target: { value: 'jazz' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    await waitFor(() => {
      expect(createTag).toHaveBeenCalledWith('jazz', 'test-admin-token');
    });
  });

  it('shows inline confirmation when delete button is clicked', async () => {
    await renderAsAdmin();

    await waitFor(() => expect(screen.getByText('rock')).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole('button', { name: 'Supprimer le tag' });
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByRole('button', { name: 'Confirmer ?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
  });

  it('calls deleteTag after confirming deletion', async () => {
    await renderAsAdmin();
    const { deleteTag } = jest.requireMock('../api/tags') as { deleteTag: jest.Mock };

    await waitFor(() => expect(screen.getByText('rock')).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole('button', { name: 'Supprimer le tag' });
    fireEvent.click(deleteButtons[0]);

    fireEvent.click(screen.getByRole('button', { name: 'Confirmer ?' }));

    await waitFor(() => {
      expect(deleteTag).toHaveBeenCalled();
    });
  });

  it('cancels deletion when cancel button is clicked', async () => {
    await renderAsAdmin();
    const { deleteTag } = jest.requireMock('../api/tags') as { deleteTag: jest.Mock };

    await waitFor(() => expect(screen.getByText('rock')).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole('button', { name: 'Supprimer le tag' });
    fireEvent.click(deleteButtons[0]);

    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(screen.queryByRole('button', { name: 'Confirmer ?' })).not.toBeInTheDocument();
    expect(deleteTag).not.toHaveBeenCalled();
  });

  it('shows inline rename input when rename button is clicked', async () => {
    await renderAsAdmin();

    await waitFor(() => expect(screen.getByText('rock')).toBeInTheDocument());

    const renameButtons = screen.getAllByRole('button', { name: 'Renommer le tag' });
    fireEvent.click(renameButtons[0]);

    expect(screen.getByRole('textbox', { name: 'Nouveau nom du tag' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Valider' })).toBeInTheDocument();
  });

  it('calls renameTag when rename is validated', async () => {
    await renderAsAdmin();
    const { renameTag } = jest.requireMock('../api/tags') as { renameTag: jest.Mock };

    await waitFor(() => expect(screen.getByText('rock')).toBeInTheDocument());

    const renameButtons = screen.getAllByRole('button', { name: 'Renommer le tag' });
    fireEvent.click(renameButtons[0]);

    const renameInput = screen.getByRole('textbox', { name: 'Nouveau nom du tag' });
    fireEvent.change(renameInput, { target: { value: 'metal' } });
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    await waitFor(() => {
      expect(renameTag).toHaveBeenCalledWith('tag-1', 'metal', 'test-admin-token');
    });
  });

  it('shows error message when createTag fails', async () => {
    await renderAsAdmin();
    const { createTag } = jest.requireMock('../api/tags') as { createTag: jest.Mock };
    createTag.mockRejectedValueOnce(new Error('Tag already exists'));

    await waitFor(() => expect(screen.getByText('rock')).toBeInTheDocument());

    fireEvent.change(screen.getByRole('textbox', { name: 'Nom du nouveau tag' }), {
      target: { value: 'rock' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    await waitFor(() => {
      expect(screen.getByText('Tag already exists')).toBeInTheDocument();
    });
  });
});
