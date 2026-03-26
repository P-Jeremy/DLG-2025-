import React, { useState } from 'react';
import type { Tag } from '../api/tags';
import './TagRenameInput.scss';

interface TagRenameInputProps {
  tag: Tag;
  onConfirm: (tagId: string, newName: string) => Promise<void>;
  onCancel: () => void;
  disabled: boolean;
}

const TagRenameInput: React.FC<TagRenameInputProps> = ({ tag, onConfirm, onCancel, disabled }) => {
  const [name, setName] = useState(tag.name);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || name.trim() === tag.name) {
      onCancel();
      return;
    }
    setSubmitting(true);
    await onConfirm(tag.id, name.trim());
    setSubmitting(false);
  };

  return (
    <div className="tag-rename-input">
      <input
        className="tag-rename-input__field"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={disabled || submitting}
        autoFocus
        aria-label="Nouveau nom du tag"
      />
      <button
        className="tag-rename-input__validate-btn"
        type="button"
        disabled={disabled || submitting || !name.trim()}
        onClick={() => void handleSubmit()}
      >
        Valider
      </button>
      <button
        className="tag-rename-input__cancel-btn"
        type="button"
        disabled={disabled || submitting}
        onClick={onCancel}
      >
        Annuler
      </button>
    </div>
  );
};

export default TagRenameInput;
