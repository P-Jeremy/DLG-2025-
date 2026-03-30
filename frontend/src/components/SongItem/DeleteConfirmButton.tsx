import React from 'react';

interface DeleteConfirmButtonProps {
  isConfirmingDelete: boolean;
  isDeleting: boolean;
  songTitle: string;
  onShowConfirm: (e: React.MouseEvent) => void;
  onConfirm: (e: React.MouseEvent) => Promise<void>;
  onCancel: (e: React.MouseEvent) => void;
}

const DeleteConfirmButton: React.FC<DeleteConfirmButtonProps> = ({
  isConfirmingDelete,
  isDeleting,
  songTitle,
  onShowConfirm,
  onConfirm,
  onCancel,
}) => {
  if (isConfirmingDelete) {
    return (
      <div
        className="song-delete-confirm"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="song-delete-confirm__label">Supprimer cette chanson ?</span>
        <button
          className="song-delete-confirm__confirm-btn"
          type="button"
          disabled={isDeleting}
          onClick={(e) => void onConfirm(e)}
          aria-label="Confirmer la suppression"
        >
          Confirmer
        </button>
        <button
          className="song-delete-confirm__cancel-btn"
          type="button"
          disabled={isDeleting}
          onClick={onCancel}
          aria-label="Annuler la suppression"
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      className="song-delete-btn"
      type="button"
      disabled={isDeleting}
      onClick={onShowConfirm}
      aria-label={`Supprimer la chanson ${songTitle}`}
    >
      <span className="material-icons">delete</span>
    </button>
  );
};

export default DeleteConfirmButton;
