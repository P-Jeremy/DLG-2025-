import React, { useState } from 'react';
import type { Playlist } from '../api/playlists';
import './PlaylistRenameInput.scss';

interface PlaylistRenameInputProps {
  playlist: Playlist;
  onConfirm: (newName: string) => Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
}

const PlaylistRenameInput: React.FC<PlaylistRenameInputProps> = ({ playlist, onConfirm, onCancel, disabled = false }) => {
  const [name, setName] = useState(playlist.name);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || name.trim() === playlist.name) {
      onCancel();
      return;
    }
    setSubmitting(true);
    await onConfirm(name.trim());
    setSubmitting(false);
  };

  return (
    <div className="playlist-rename-input">
      <input
        className="playlist-rename-input__field"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={disabled || submitting}
        autoFocus
        aria-label="Nouveau nom de la playlist"
      />
      <button
        className="playlist-rename-input__validate-btn"
        type="button"
        disabled={disabled || submitting || !name.trim()}
        onClick={() => void handleSubmit()}
      >
        Valider
      </button>
      <button
        className="playlist-rename-input__cancel-btn"
        type="button"
        disabled={disabled || submitting}
        onClick={onCancel}
      >
        Annuler
      </button>
    </div>
  );
};

export default PlaylistRenameInput;
