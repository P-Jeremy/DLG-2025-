import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { activateAccount } from '../api/auth';
import { getErrorMessage } from '../utils/errorHandling';
import AppBackground from '../components/AppBackground';

type ActivationState = 'loading' | 'success' | 'error';

function isLoadingActivation(state: ActivationState): boolean {
  return state === 'loading';
}

function isActivationSuccessful(state: ActivationState): boolean {
  return state === 'success';
}

function isActivationFailed(state: ActivationState): boolean {
  return state === 'error';
}

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
          setErrorMessage(getErrorMessage(err));
          setState('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AppBackground>
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">DLG</h1>
        {isLoadingActivation(state) && (
          <p>Activation en cours...</p>
        )}
        {isActivationSuccessful(state) && (
          <div className="auth-success">
            Votre compte a été activé avec succès.
          </div>
        )}
        {isActivationFailed(state) && (
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
    </AppBackground>
  );
};

export default ActivateAccountPage;
