import React from 'react';
import './PlaylistDeleteConfirm.scss';

interface PlaylistDeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

const PlaylistDeleteConfirm: React.FC<PlaylistDeleteConfirmProps> = ({ onConfirm, onCancel, disabled = false }) => (
  <div className="playlist-delete-confirm">
    <button
      className="playlist-delete-confirm__confirm-btn"
      type="button"
      disabled={disabled}
      onClick={onConfirm}
    >
      Confirmer ?
    </button>
    <button
      className="playlist-delete-confirm__cancel-btn"
      type="button"
      disabled={disabled}
      onClick={onCancel}
    >
      Annuler
    </button>
  </div>
);

export default PlaylistDeleteConfirm;
