import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ActivateAccountPage from './ActivateAccountPage';
import { AuthProvider } from '../contexts/AuthContext';

type GlobalWithFetch = typeof globalThis & { fetch: jest.Mock };

const renderActivateAccountPage = (token = 'activation-token') =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/activate/${token}`]}>
        <Routes>
          <Route path="/activate/:token" element={<ActivateAccountPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

describe('Integration | Page | ActivateAccountPage', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows loading message while the request is pending', () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockReturnValue(new Promise(() => undefined));

    renderActivateAccountPage();

    expect(screen.getByText('Activation en cours...')).toBeInTheDocument();
  });

  it('shows success message when activation succeeds', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    renderActivateAccountPage();

    await waitFor(() => {
      expect(screen.getByText('Votre compte a été activé avec succès.')).toBeInTheDocument();
    });
  });

  it('calls the correct API endpoint with the token from URL', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    renderActivateAccountPage('my-token-abc');

    await waitFor(() => {
      expect((globalThis as GlobalWithFetch).fetch).toHaveBeenCalledWith('/api/auth/activate/my-token-abc');
    });
  });

  it('shows error message when activation fails', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Token expiré' }),
    } as Response);

    renderActivateAccountPage();

    await waitFor(() => {
      expect(screen.getByText('Token expiré')).toBeInTheDocument();
    });
  });

  it('shows a link to the login page', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    renderActivateAccountPage();

    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });
});
