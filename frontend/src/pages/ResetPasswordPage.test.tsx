import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResetPasswordPage from './ResetPasswordPage';
import { AuthProvider } from '../contexts/AuthContext';

type GlobalWithFetch = typeof globalThis & { fetch: jest.Mock };

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderResetPasswordPage = (token = 'reset-token') =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/reset-password/${token}`]}>
        <Routes>
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

describe('Integration | Page | ResetPasswordPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders new password field and submit button', () => {
    renderResetPasswordPage();

    expect(screen.getByLabelText('Nouveau mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réinitialiser le mot de passe' })).toBeInTheDocument();
  });

  it('renders a link back to login', () => {
    renderResetPasswordPage();

    expect(screen.getByText(/Retour à la connexion/)).toBeInTheDocument();
  });

  it('disables the submit button while loading', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockReturnValue(new Promise(() => undefined));

    renderResetPasswordPage();

    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'newpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Réinitialiser le mot de passe' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Réinitialisation...' })).toBeDisabled();
    });
  });

  it('navigates to /login on successful reset', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    renderResetPasswordPage();

    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'newpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Réinitialiser le mot de passe' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('sends the token from URL params to the API', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    renderResetPasswordPage('my-special-token');

    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'newpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Réinitialiser le mot de passe' }));

    await waitFor(() => {
      expect((globalThis as GlobalWithFetch).fetch).toHaveBeenCalledWith(
        '/api/auth/reset-password',
        expect.objectContaining({
          body: JSON.stringify({ token: 'my-special-token', newPassword: 'newpass' }),
        })
      );
    });
  });

  it('displays error message on failed reset', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Token invalide ou expiré' }),
    } as Response);

    renderResetPasswordPage();

    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'newpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Réinitialiser le mot de passe' }));

    await waitFor(() => {
      expect(screen.getByText('Token invalide ou expiré')).toBeInTheDocument();
    });
  });
});
