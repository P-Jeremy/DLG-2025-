import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from './ForgotPasswordPage';
import { AuthProvider } from '../contexts/AuthContext';

type GlobalWithFetch = typeof globalThis & { fetch: jest.Mock };

const renderForgotPasswordPage = () =>
  render(
    <AuthProvider>
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    </AuthProvider>
  );

describe('Integration | Page | ForgotPasswordPage', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders email field and submit button', () => {
    renderForgotPasswordPage();

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' })).toBeInTheDocument();
  });

  it('renders a link back to login', () => {
    renderForgotPasswordPage();

    expect(screen.getByText(/Retour à la connexion/)).toBeInTheDocument();
  });

  it('disables the submit button while loading', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockReturnValue(new Promise(() => undefined));

    renderForgotPasswordPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Envoi...' })).toBeDisabled();
    });
  });

  it('shows success message after successful request', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    renderForgotPasswordPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' }));

    await waitFor(() => {
      expect(screen.getByText('Si un compte existe, un email a été envoyé')).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Erreur serveur' }),
    } as Response);

    renderForgotPasswordPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' }));

    await waitFor(() => {
      expect(screen.getByText('Erreur serveur')).toBeInTheDocument();
    });
  });
});
