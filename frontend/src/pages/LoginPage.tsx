import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorHandling';
import AppBackground from '../components/AppBackground';
import PasswordInput from '../components/PasswordInput';
import './LoginPage.scss';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await login({ email, password });
      authLogin(result.token, result.pseudo);
      void navigate('/');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppBackground>
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">DLG</h1>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Mot de passe</label>
            <PasswordInput
              id="password"
              className="auth-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="auth-actions">
            <button
              className="auth-button auth-button--secondary"
              type="button"
              onClick={() => void navigate('/')}
            >
              Retour à l&apos;accueil
            </button>
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>
        <div className="auth-links">
          <Link className="auth-link" to="/forgot-password">
            Mot de passe oublié ?
          </Link>
          <Link className="auth-link" to="/register">
            Pas encore de compte ? S&apos;inscrire
          </Link>
        </div>
      </div>
    </div>
    </AppBackground>
  );
};

export default LoginPage;
