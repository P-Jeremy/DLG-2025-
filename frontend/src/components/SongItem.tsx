import React, { useEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import DOMPurify from 'dompurify';
import type { Song } from '../types/song';
import { NAVBAR_HEIGHT_PX } from '../constants/layout';
import DeleteConfirmButton from './SongItem/DeleteConfirmButton';
import './SongItem.scss';

interface SongItemProps {
  song: Song;
  isAdmin?: boolean;
  onDelete?: (songId: string) => Promise<void>;
  onEdit?: (songId: string) => void;
  isOpen: boolean;
  onOpen: (songId: string | null) => void;
}

const SongItem: React.FC<SongItemProps> = ({ song, isAdmin = false, onDelete, onEdit, isOpen, onOpen }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showTab, setShowTab] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [tabLoaded, setTabLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [lightboxOpen]);

  useEffect(() => {
    if (isOpen) {
      setShowTab(true);
      setShowLyrics(true);
    }
  }, [isOpen]);

  const withScrollPreserved = (callback: () => void) => {
    const card = cardRef.current;
    const prevTop = card?.getBoundingClientRect().top ?? 0;
    flushSync(callback);
    if (card) {
      const delta = card.getBoundingClientRect().top - prevTop;
      window.scrollBy({ top: delta, behavior: 'instant' });
    }
  };

  const scrollCardIntoView = () => {
    const card = cardRef.current;
    if (!card) return;
    const cardTop = card.getBoundingClientRect().top;
    if (cardTop < NAVBAR_HEIGHT_PX) {
      window.scrollTo({
        top: window.scrollY + cardTop - NAVBAR_HEIGHT_PX - 8,
        behavior: 'smooth',
      });
    }
  };

  const extractFirstLetter = (text: string | undefined | null): string => {
    if (text === null || text === undefined) return '';
    const firstChar = text[0]?.toUpperCase();
    return firstChar ?? '';
  };

  const songLetter = extractFirstLetter(song.title);

  const toggleAll = () => {
    if (confirmDelete) return;
    withScrollPreserved(() => onOpen(isOpen ? null : song.id));
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
      ref={cardRef}
      className={`song-card${isOpen ? ' open' : ''}`}
      onClick={toggleAll}
      data-song-letter={songLetter}
    >
      <div className="song-title">
        <span>{song.title}</span>
        <div className="song-title__actions">
          {isAdmin && onEdit && (
            <button
              className="song-edit-btn"
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(song.id); }}
              aria-label={`Modifier la chanson ${song.title}`}
            >
              <span className="material-icons">edit</span>
            </button>
          )}
          {isAdmin && onDelete && (
            <DeleteConfirmButton
              isConfirmingDelete={confirmDelete}
              isDeleting={deleting}
              songTitle={song.title}
              onShowConfirm={handleDeleteClick}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          )}
          <span className="song-chevron">
            {isOpen ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {song.author && <div className="song-author">{song.author}</div>}

      {isOpen && (
        <div
          className="song-details"
          onClick={e => e.stopPropagation()}
        >
          <div className="song-details-actions">
            {song.tab && (
              <button className={showTab ? 'active' : ''} onClick={() => {
                if (showTab) {
                  flushSync(() => setShowTab(false));
                  scrollCardIntoView();
                } else {
                  withScrollPreserved(() => setShowTab(true));
                }
              }}>
                {'Tablature'}
              </button>
            )}
            {song.lyrics && (
              <button className={showLyrics ? 'active' : ''} onClick={() => {
                if (showLyrics) {
                  flushSync(() => setShowLyrics(false));
                  scrollCardIntoView();
                } else {
                  withScrollPreserved(() => setShowLyrics(true));
                }
              }}>
                {'Paroles'}
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
                  className={`song-tab-img${tabLoaded ? ' song-tab-img--zoomable' : ' song-tab-img--loading'}`}
                  onLoad={() => setTabLoaded(true)}
                  onClick={() => tabLoaded && setLightboxOpen(true)}
                />
              </div>
            </div>
          )}

          {lightboxOpen && song.tab && createPortal(
            <div
              className="tab-lightbox"
              onClick={() => setLightboxOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label="Tablature en plein écran"
            >
              <button
                className="tab-lightbox__close"
                type="button"
                aria-label="Fermer"
                onClick={() => setLightboxOpen(false)}
              >
                <span className="material-icons">close</span>
              </button>
              <img
                src={song.tab}
                alt="Tablature"
                className="tab-lightbox__img"
                onClick={e => e.stopPropagation()}
              />
            </div>,
            document.body,
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
