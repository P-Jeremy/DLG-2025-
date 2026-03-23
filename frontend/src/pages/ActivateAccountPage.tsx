import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { activateAccount } from '../api/auth';

type ActivationState = 'loading' | 'success' | 'error';

const ActivateAccountPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<ActivationState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setState('error');
      setErrorMessage('Token manquant');
      return;
    }

    activateAccount(token)
      .then(() => {
        if (!cancelled) setState('success');
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setErrorMessage((err as Error).message);
          setState('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">DLG</h1>
        {state === 'loading' && (
          <p>Activation en cours...</p>
        )}
        {state === 'success' && (
          <div className="auth-success">
            Votre compte a été activé avec succès.
          </div>
        )}
        {state === 'error' && (
          <div className="auth-error">
            {errorMessage ?? "Une erreur est survenue lors de l'activation."}
          </div>
        )}
        <div className="auth-links">
          <Link className="auth-link" to="/login">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActivateAccountPage;
