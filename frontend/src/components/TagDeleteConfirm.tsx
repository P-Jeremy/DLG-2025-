import React from 'react';
import './TagDeleteConfirm.scss';

interface TagDeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
  disabled: boolean;
}

const TagDeleteConfirm: React.FC<TagDeleteConfirmProps> = ({ onConfirm, onCancel, disabled }) => (
  <div className="tag-delete-confirm">
    <button
      className="tag-delete-confirm__confirm-btn"
      type="button"
      disabled={disabled}
      onClick={onConfirm}
    >
      Confirmer ?
    </button>
    <button
      className="tag-delete-confirm__cancel-btn"
      type="button"
      disabled={disabled}
      onClick={onCancel}
    >
      Annuler
    </button>
  </div>
);

export default TagDeleteConfirm;
