import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import './RegisterPage.scss';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({ email, pseudo, password, apiKey });
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">DLG</h1>
        {error && <div className="auth-error">{error}</div>}
        {success ? (
          <div className="auth-success">
            Vérifiez votre email pour activer votre compte
          </div>
        ) : (
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
              <label htmlFor="pseudo">Pseudo</label>
              <input
                id="pseudo"
                className="auth-input"
                type="text"
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                className="auth-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="passwordConfirm">Confirmer le mot de passe</label>
              <input
                id="passwordConfirm"
                className="auth-input"
                type="password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="apiKey">Clé d&apos;accès</label>
              <input
                id="apiKey"
                className="auth-input"
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <div className="auth-actions">
              <button
                className="auth-button auth-button--secondary"
                type="button"
                onClick={() => void navigate('/')}
              >
                Annuler
              </button>
              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? 'Inscription...' : "S'inscrire"}
              </button>
            </div>
          </form>
        )}
        <div className="auth-links">
          <Link className="auth-link" to="/login">
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
