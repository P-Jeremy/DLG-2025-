import React, { useState } from 'react';
import './PasswordInput.scss';

interface PasswordInputProps {
  id: string;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  className = '',
  value,
  onChange,
  required,
  autoComplete,
}) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="password-input-wrapper">
      <input
        id={id}
        className={className}
        type={revealed ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="password-input-toggle"
        aria-label={revealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        onClick={() => setRevealed(r => !r)}
        tabIndex={-1}
      >
        <span className="material-icons">
          {revealed ? 'visibility_off' : 'visibility'}
        </span>
      </button>
    </div>
  );
};

export default PasswordInput;
