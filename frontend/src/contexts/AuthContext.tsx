import React, { createContext, useContext, useState } from 'react';
import { decodeJwtPayload } from '../utils/jwt';

const TOKEN_KEY = 'dlg_token';
const PSEUDO_KEY = 'dlg_pseudo';

interface AuthContextValue {
  token: string | null;
  isAdmin: boolean;
  pseudo: string | null;
  userId: string | null;
  login(token: string, pseudo: string): void;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function extractPayload(token: string | null): { userId: string | null; isAdmin: boolean } {
  if (!token) return { userId: null, isAdmin: false };
  const payload = decodeJwtPayload(token);
  return {
    userId: payload?.userId ?? null,
    isAdmin: payload?.isAdmin === true,
  };
}

function readFromStorage(): { token: string | null; isAdmin: boolean; pseudo: string | null; userId: string | null } {
  const token = localStorage.getItem(TOKEN_KEY);
  const { userId, isAdmin } = extractPayload(token);
  return {
    token,
    isAdmin,
    pseudo: localStorage.getItem(PSEUDO_KEY),
    userId,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(readFromStorage);

  const login = (token: string, pseudo: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PSEUDO_KEY, pseudo);
    const { userId, isAdmin } = extractPayload(token);
    setState({ token, isAdmin, pseudo, userId });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PSEUDO_KEY);
    setState({ token: null, isAdmin: false, pseudo: null, userId: null });
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
