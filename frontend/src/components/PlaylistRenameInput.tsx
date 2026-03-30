import React, { useState } from 'react';
import type { Playlist } from '../api/playlists';
import { isPlaylistNameNotEmpty, getTrimmedInput } from '../utils/validators';
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
    const isNameChanged = getTrimmedInput(name) !== playlist.name;
    if (!isNameChanged) {
      onCancel();
      return;
    }
    setSubmitting(true);
    await onConfirm(getTrimmedInput(name));
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
        disabled={disabled || submitting || !isPlaylistNameNotEmpty(name)}
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
