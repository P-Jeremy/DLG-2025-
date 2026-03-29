import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminUsersPage from './AdminUsersPage';
import { AuthProvider } from '../../contexts/AuthContext';
import { SearchProvider } from '../../contexts/SearchContext';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../api/users', () => ({
  fetchUsers: jest.fn(),
  setUserRole: jest.fn(),
}));

const ADMIN_TOKEN = 'header.' + btoa(JSON.stringify({ userId: 'user-1', email: 'admin@test.com', isAdmin: true })) + '.signature';

const mockUsers = [
  { id: 'user-1', email: 'admin@test.com', pseudo: 'admin', isAdmin: true },
  { id: 'user-2', email: 'user@test.com', pseudo: 'user', isAdmin: false },
];

const renderPage = async () => {
  localStorage.setItem('dlg_token', ADMIN_TOKEN);
  localStorage.setItem('dlg_pseudo', 'admin');

  await act(async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <MemoryRouter>
            <AdminUsersPage />
          </MemoryRouter>
        </SearchProvider>
      </AuthProvider>,
    );
  });
};

describe('AdminUsersPage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders loading state initially', async () => {
    const { fetchUsers } = jest.requireMock('../../api/users') as { fetchUsers: jest.Mock };
    fetchUsers.mockReturnValue(new Promise(() => undefined));

    localStorage.setItem('dlg_token', ADMIN_TOKEN);
    localStorage.setItem('dlg_pseudo', 'admin');

    render(
      <AuthProvider>
        <SearchProvider>
          <MemoryRouter>
            <AdminUsersPage />
          </MemoryRouter>
        </SearchProvider>
      </AuthProvider>,
    );

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('renders user list with email, pseudo and toggle after loading', async () => {
    const { fetchUsers } = jest.requireMock('../../api/users') as { fetchUsers: jest.Mock };
    fetchUsers.mockResolvedValue(mockUsers);

    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      expect(screen.getByText('user@test.com')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
    });

    const toggles = screen.getAllByRole('checkbox').filter(
      (el) => el.getAttribute('aria-label') !== 'Trier par artiste',
    );
    expect(toggles).toHaveLength(2);
  });

  it('disables toggle for current user', async () => {
    const { fetchUsers } = jest.requireMock('../../api/users') as { fetchUsers: jest.Mock };
    fetchUsers.mockResolvedValue(mockUsers);

    await renderPage();

    await waitFor(() => expect(screen.getByText('admin@test.com')).toBeInTheDocument());

    const adminToggle = screen.getByRole('checkbox', { name: /admin pour admin/i });
    const userToggle = screen.getByRole('checkbox', { name: /admin pour user$/i });

    expect(adminToggle).toBeDisabled();
    expect(userToggle).not.toBeDisabled();
  });

  it('calls setUserRole when toggle is clicked for another user', async () => {
    const { fetchUsers, setUserRole } = jest.requireMock('../../api/users') as {
      fetchUsers: jest.Mock;
      setUserRole: jest.Mock;
    };
    fetchUsers.mockResolvedValue(mockUsers);
    setUserRole.mockResolvedValue({ ...mockUsers[1], isAdmin: true });

    await renderPage();

    await waitFor(() => expect(screen.getByText('user@test.com')).toBeInTheDocument());

    const userToggle = screen.getByRole('checkbox', { name: /admin pour user$/i });
    fireEvent.click(userToggle);

    await waitFor(() => {
      expect(setUserRole).toHaveBeenCalledWith('user-2', true, ADMIN_TOKEN);
    });
  });
});
