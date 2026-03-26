import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import AppBackground from '../components/AppBackground';
import './ForgotPasswordPage.scss';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPassword({ email });
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message);
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
        {success ? (
          <div className="auth-success">
            Si un compte existe, un email a été envoyé
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
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
            </button>
          </form>
        )}
        <div className="auth-links">
          <Link className="auth-link" to="/login">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
    </AppBackground>
  );
};

export default ForgotPasswordPage;
