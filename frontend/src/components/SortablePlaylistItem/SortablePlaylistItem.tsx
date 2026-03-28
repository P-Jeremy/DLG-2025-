import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import type { Song } from '../../types/song';
import PlaylistSongRemoveConfirm from '../PlaylistSongRemoveConfirm';
import './SortablePlaylistItem.scss';

interface SortablePlaylistItemProps {
  song: Song;
  index: number;
  totalCount: number;
  saving: boolean;
  confirmRemoveId: string | null;
  removingId: string | null;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onConfirmRemove: (id: string) => void;
  onCancelRemove: () => void;
  onRemove: (id: string) => void;
}

const SortablePlaylistItem: React.FC<SortablePlaylistItemProps> = ({
  song,
  index,
  totalCount,
  saving,
  confirmRemoveId,
  removingId,
  onMove,
  onConfirmRemove,
  onCancelRemove,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id: song.id });

  const itemClassName = [
    'admin-playlist-item',
    isDragging ? 'admin-playlist-item--is-dragging' : '',
  ].filter(Boolean).join(' ');

  return (
    <li ref={setNodeRef} className={itemClassName}>
      <span
        className="admin-playlist-item__drag-handle"
        aria-hidden="true"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </span>
      <span className="admin-playlist-item__position">{index + 1}</span>
      <div className="admin-playlist-item__info">
        <span className="admin-playlist-item__title">{song.title}</span>
        <span className="admin-playlist-item__author">{song.author}</span>
      </div>
      <div className="admin-playlist-item__controls">
        <button
          className="admin-playlist-item__btn"
          type="button"
          disabled={index === 0 || saving}
          onClick={() => onMove(index, 'up')}
          aria-label="Monter"
        >
          ▲
        </button>
        <button
          className="admin-playlist-item__btn"
          type="button"
          disabled={index === totalCount - 1 || saving}
          onClick={() => onMove(index, 'down')}
          aria-label="Descendre"
        >
          ▼
        </button>
      </div>
      {confirmRemoveId === song.id ? (
        <PlaylistSongRemoveConfirm
          onConfirm={() => onRemove(song.id)}
          onCancel={onCancelRemove}
          disabled={removingId === song.id}
        />
      ) : (
        <button
          className="admin-playlist-item__remove-btn"
          type="button"
          disabled={saving || removingId !== null}
          onClick={(e) => { e.stopPropagation(); onConfirmRemove(song.id); }}
          aria-label={`Retirer ${song.title} de la playlist`}
        >
          <span className="material-icons">delete</span>
        </button>
      )}
    </li>
  );
};

export default SortablePlaylistItem;
