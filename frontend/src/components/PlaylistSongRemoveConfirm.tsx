import React from 'react';
import './PlaylistSongRemoveConfirm.scss';

interface PlaylistSongRemoveConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
  disabled: boolean;
}

const PlaylistSongRemoveConfirm: React.FC<PlaylistSongRemoveConfirmProps> = ({ onConfirm, onCancel, disabled }) => (
  <div className="playlist-song-remove-confirm">
    <button
      className="playlist-song-remove-confirm__confirm-btn"
      type="button"
      disabled={disabled}
      onClick={onConfirm}
    >
      Confirmer
    </button>
    <button
      className="playlist-song-remove-confirm__cancel-btn"
      type="button"
      disabled={disabled}
      onClick={onCancel}
    >
      Annuler
    </button>
  </div>
);

export default PlaylistSongRemoveConfirm;
