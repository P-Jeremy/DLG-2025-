import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const TOKEN_KEY = 'dlg_token';
const IS_ADMIN_KEY = 'dlg_is_admin';
const PSEUDO_KEY = 'dlg_pseudo';

const TestConsumer = () => {
  const { token, isAdmin, pseudo, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{token ?? 'null'}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
      <span data-testid="pseudo">{pseudo ?? 'null'}</span>
      <button onClick={() => login('tok123', true, 'admin')}>login</button>
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

  it('updates state after calling login', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    fireEvent.click(screen.getByText('login'));

    expect(screen.getByTestId('token')).toHaveTextContent('tok123');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
    expect(screen.getByTestId('pseudo')).toHaveTextContent('admin');
  });

  it('persists token in localStorage after login', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    fireEvent.click(screen.getByText('login'));

    expect(localStorage.getItem(TOKEN_KEY)).toBe('tok123');
    expect(localStorage.getItem(IS_ADMIN_KEY)).toBe('true');
    expect(localStorage.getItem(PSEUDO_KEY)).toBe('admin');
  });

  it('resets state to null after logout', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    fireEvent.click(screen.getByText('login'));
    fireEvent.click(screen.getByText('logout'));

    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
    expect(screen.getByTestId('pseudo')).toHaveTextContent('null');
  });

  it('removes token from localStorage after logout', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    fireEvent.click(screen.getByText('login'));
    fireEvent.click(screen.getByText('logout'));

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(IS_ADMIN_KEY)).toBeNull();
    expect(localStorage.getItem(PSEUDO_KEY)).toBeNull();
  });

  it('restores auth state from localStorage on mount', () => {
    localStorage.setItem(TOKEN_KEY, 'stored-token');
    localStorage.setItem(IS_ADMIN_KEY, 'true');
    localStorage.setItem(PSEUDO_KEY, 'storedUser');

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
    expect(screen.getByTestId('pseudo')).toHaveTextContent('storedUser');
  });

  it('throws when useAuth is used outside of AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});
