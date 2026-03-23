import React, { createContext, useContext, useState } from 'react';

const TOKEN_KEY = 'dlg_token';
const IS_ADMIN_KEY = 'dlg_is_admin';
const PSEUDO_KEY = 'dlg_pseudo';

interface AuthContextValue {
  token: string | null;
  isAdmin: boolean;
  pseudo: string | null;
  login(token: string, isAdmin: boolean, pseudo: string): void;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readFromStorage(): { token: string | null; isAdmin: boolean; pseudo: string | null } {
  return {
    token: localStorage.getItem(TOKEN_KEY),
    isAdmin: localStorage.getItem(IS_ADMIN_KEY) === 'true',
    pseudo: localStorage.getItem(PSEUDO_KEY),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(readFromStorage);

  const login = (token: string, isAdmin: boolean, pseudo: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(IS_ADMIN_KEY, String(isAdmin));
    localStorage.setItem(PSEUDO_KEY, pseudo);
    setState({ token, isAdmin, pseudo });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(IS_ADMIN_KEY);
    localStorage.removeItem(PSEUDO_KEY);
    setState({ token: null, isAdmin: false, pseudo: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
