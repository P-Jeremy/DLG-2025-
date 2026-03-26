import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const TOKEN_KEY = 'dlg_token';
const PSEUDO_KEY = 'dlg_pseudo';

const ADMIN_TOKEN =
  'header.' +
  btoa(JSON.stringify({ userId: 'user-1', email: 'admin@test.com', isAdmin: true })) +
  '.signature';

const NON_ADMIN_TOKEN =
  'header.' +
  btoa(JSON.stringify({ userId: 'user-2', email: 'user@test.com', isAdmin: false })) +
  '.signature';

const TestConsumer = () => {
  const { token, isAdmin, pseudo, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{token ?? 'null'}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
      <span data-testid="pseudo">{pseudo ?? 'null'}</span>
      <button onClick={() => login(ADMIN_TOKEN, 'admin')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
};

describe('Unit | Context | AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('provides null token, false isAdmin and null pseudo by default', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
    expect(screen.getByTestId('pseudo')).toHaveTextContent('null');
  });

  it('updates state after calling login with an admin token', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    fireEvent.click(screen.getByText('login'));

    expect(screen.getByTestId('token')).toHaveTextContent(ADMIN_TOKEN);
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
    expect(screen.getByTestId('pseudo')).toHaveTextContent('admin');
  });

  it('persists token and pseudo in localStorage after login', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    fireEvent.click(screen.getByText('login'));

    expect(localStorage.getItem(TOKEN_KEY)).toBe(ADMIN_TOKEN);
    expect(localStorage.getItem(PSEUDO_KEY)).toBe('admin');
  });

  it('does not persist isAdmin as a separate localStorage entry', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    fireEvent.click(screen.getByText('login'));

    expect(localStorage.getItem('dlg_is_admin')).toBeNull();
  });

  it('resets state to null after logout', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    fireEvent.click(screen.getByText('login'));
    fireEvent.click(screen.getByText('logout'));

    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
    expect(screen.getByTestId('pseudo')).toHaveTextContent('null');
  });

  it('removes token and pseudo from localStorage after logout', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    fireEvent.click(screen.getByText('login'));
    fireEvent.click(screen.getByText('logout'));

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(PSEUDO_KEY)).toBeNull();
  });

  it('restores auth state from localStorage on mount using JWT payload', () => {
    localStorage.setItem(TOKEN_KEY, ADMIN_TOKEN);
    localStorage.setItem(PSEUDO_KEY, 'storedUser');

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    expect(screen.getByTestId('token')).toHaveTextContent(ADMIN_TOKEN);
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
    expect(screen.getByTestId('pseudo')).toHaveTextContent('storedUser');
  });

  it('restores isAdmin as false when JWT payload has isAdmin false', () => {
    localStorage.setItem(TOKEN_KEY, NON_ADMIN_TOKEN);
    localStorage.setItem(PSEUDO_KEY, 'regularUser');

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
  });

  it('throws when useAuth is used outside of AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});
