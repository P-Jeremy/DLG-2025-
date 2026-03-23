import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { AuthProvider } from '../contexts/AuthContext';

type GlobalWithFetch = typeof globalThis & { fetch: jest.Mock };

const renderRegisterPage = () =>
  render(
    <AuthProvider>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </AuthProvider>
  );

describe('Integration | Page | RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders email, pseudo and password fields with submit button', () => {
    renderRegisterPage();

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Pseudo')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "S'inscrire" })).toBeInTheDocument();
  });

  it('renders a link to the login page', () => {
    renderRegisterPage();

    expect(screen.getByText(/Se connecter/)).toBeInTheDocument();
  });

  it('disables the submit button while loading', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockReturnValue(new Promise(() => undefined));

    renderRegisterPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Pseudo'), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText("Clé d'accès"), { target: { value: 'key' } });
    fireEvent.click(screen.getByRole('button', { name: "S'inscrire" }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Inscription...' })).toBeDisabled();
    });
  });

  it('shows success message after successful registration', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    renderRegisterPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Pseudo'), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText("Clé d'accès"), { target: { value: 'key' } });
    fireEvent.click(screen.getByRole('button', { name: "S'inscrire" }));

    await waitFor(() => {
      expect(screen.getByText('Vérifiez votre email pour activer votre compte')).toBeInTheDocument();
    });
  });

  it('displays error message on failed registration', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Email déjà utilisé' }),
    } as Response);

    renderRegisterPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Pseudo'), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText("Clé d'accès"), { target: { value: 'key' } });
    fireEvent.click(screen.getByRole('button', { name: "S'inscrire" }));

    await waitFor(() => {
      expect(screen.getByText('Email déjà utilisé')).toBeInTheDocument();
    });
  });
});
