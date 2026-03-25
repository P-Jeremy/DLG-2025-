import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import type { Song } from '../types/song';
import './SongItem.scss';

interface SongItemProps {
  song: Song;
}

const SongItem: React.FC<SongItemProps> = ({ song }) => {
  const [open, setOpen] = useState(false);
  const [showTab, setShowTab] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [tabLoaded, setTabLoaded] = useState(false);

  const toggleAll = () => {
    setOpen(o => !o);
    if (!open) {
      setShowTab(true);
      setShowLyrics(true);
    }
  };

  return (
    <div
      className={`song-card${open ? ' open' : ''}`}
      onClick={toggleAll}
    >
      <div className="song-title">
        <span>{song.title}</span>
        <span className="song-chevron">
          {open ? '▲' : '▼'}
        </span>
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
