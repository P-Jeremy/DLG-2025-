import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import type { Song } from '../types/song';
import './SongItem.scss';

interface SongItemProps {
  song: Song;
  isAdmin?: boolean;
  onDelete?: (songId: string) => Promise<void>;
}

const SongItem: React.FC<SongItemProps> = ({ song, isAdmin = false, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [showTab, setShowTab] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [tabLoaded, setTabLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleAll = () => {
    if (confirmDelete) return;
    setOpen(o => !o);
    if (!open) {
      setShowTab(true);
      setShowLyrics(true);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(song.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(false);
  };

  return (
    <div
      className={`song-card${open ? ' open' : ''}`}
      onClick={toggleAll}
    >
      <div className="song-title">
        <span>{song.title}</span>
        <div className="song-title__actions">
          {isAdmin && onDelete && (
            confirmDelete ? (
              <div
                className="song-delete-confirm"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="song-delete-confirm__label">Supprimer cette chanson ?</span>
                <button
                  className="song-delete-confirm__confirm-btn"
                  type="button"
                  disabled={deleting}
                  onClick={(e) => void handleConfirmDelete(e)}
                  aria-label="Confirmer la suppression"
                >
                  Confirmer
                </button>
                <button
                  className="song-delete-confirm__cancel-btn"
                  type="button"
                  disabled={deleting}
                  onClick={handleCancelDelete}
                  aria-label="Annuler la suppression"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                className="song-delete-btn"
                type="button"
                disabled={deleting}
                onClick={handleDeleteClick}
                aria-label={`Supprimer la chanson ${song.title}`}
              >
                <span className="material-icons">delete</span>
              </button>
            )
          )}
          <span className="song-chevron">
            {open ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {song.tags && song.tags.length > 0 && (
        <ul
          className="song-tags"
          onClick={e => e.stopPropagation()}
        >
          {song.tags.map(tag => (
            <li
              className="song-tag"
              key={tag.id || tag.name}
            >
              {tag.name}
            </li>
          ))}
        </ul>
      )}

      {song.author && <div className="song-author">{song.author}</div>}

      {open && (
        <div
          className="song-details"
          onClick={e => e.stopPropagation()}
        >
          <div className="song-details-actions">
            {song.tab && (
              <button onClick={() => setShowTab(t => !t)}>
                {showTab ? 'Masquer la tablature' : 'Afficher la tablature'}
              </button>
            )}
            {song.lyrics && (
              <button onClick={() => setShowLyrics(l => !l)}>
                {showLyrics ? 'Masquer les paroles' : 'Afficher les paroles'}
              </button>
            )}
          </div>

          {showTab && song.tab && (
            <div className="song-section">
              <div className="song-section-title">Tablature</div>
              <div className="song-section-content song-section-content--centered">
                {!tabLoaded && <div className="song-tab-loading">Chargement…</div>}
                <img
                  src={song.tab}
                  alt="Tablature"
                  className={`song-tab-img${tabLoaded ? '' : ' song-tab-img--loading'}`}
                  onLoad={() => setTabLoaded(true)}
                />
              </div>
            </div>
          )}

          {showLyrics && song.lyrics && (
            <div className="song-section">
              <div className="song-section-title">Paroles</div>
              <div
                className="song-section-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(song.lyrics) }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SongItem;
