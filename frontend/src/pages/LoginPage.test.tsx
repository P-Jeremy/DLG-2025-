import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../contexts/AuthContext';

type GlobalWithFetch = typeof globalThis & { fetch: jest.Mock };

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderLoginPage = () =>
  render(
    <AuthProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthProvider>
  );

describe('Integration | Page | LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders email, password fields and submit button', () => {
    renderLoginPage();

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
  });

  it('renders links to register and forgot-password pages', () => {
    renderLoginPage();

    expect(screen.getByText(/S'inscrire/)).toBeInTheDocument();
    expect(screen.getByText(/Mot de passe oublié/)).toBeInTheDocument();
  });

  it('renders back to home button', () => {
    renderLoginPage();

    expect(screen.getByRole('button', { name: "Retour à l'accueil" })).toBeInTheDocument();
  });

  it('navigates to / when back to home button is clicked', () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: "Retour à l'accueil" }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('disables the submit button while loading', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockReturnValue(new Promise(() => undefined));

    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Connexion...' })).toBeDisabled();
    });
  });

  it('navigates to / on successful login', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'jwt', isAdmin: false, pseudo: 'user1' }),
    } as Response);

    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays error message on failed login', async () => {
    (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Identifiants invalides' }),
    } as Response);

    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => {
      expect(screen.getByText('Identifiants invalides')).toBeInTheDocument();
    });
  });
});
