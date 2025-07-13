import React, { useState } from 'react';
import type { Song } from './SongList';

interface SongItemProps {
  song: Song;
}

const SongItem: React.FC<SongItemProps> = ({ song }) => {
  const [open, setOpen] = useState(false);
  const [showTab, setShowTab] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  const toggleAll = () => {
    setOpen(o => !o);
    if (!open) {
      // Si on ouvre, on ouvre tout par défaut
      setShowTab(true);
      setShowLyrics(true);
    }
  };

  return (
    <div
      className={`song-card${open ? ' open' : ''}`}
      style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
      onClick={toggleAll}
    >
      <div
        className="song-title"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span>{song.title}</span>
        <span
          style={{ fontSize: '1.2em', color: '#1976d2', marginLeft: 8, userSelect: 'none' }}
        >
          {open ? '▲' : '▼'}
        </span>
      </div>

      {song.tags && song.tags.length > 0 && (
        <ul
          className="song-tags"
          style={{
            padding: 0,
            margin: 0,
            listStyle: 'none',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
          onClick={e => e.stopPropagation()}
        >
          {song.tags.map(tag => (
            <li
              className="song-tag"
              key={tag.id || tag.name}
              style={{ display: 'inline-block' }}
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
          style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
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
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#1976d2' }}>Tablature</div>
              <div
                style={{
                  background: '#f8f8f8',
                  borderRadius: 6,
                  padding: '0.75em',
                  textAlign: 'center'
                }}
              >
                <img
                  src={song.tab}
                  alt="Tablature"
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: 4 }}
                />
              </div>
            </div>
          )}

          {showLyrics && song.lyrics && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#1976d2' }}>Paroles</div>
              <div
                style={{
                  background: '#f8f8f8',
                  borderRadius: 6,
                  padding: '0.75em',
                  fontFamily: 'inherit'
                }}
                dangerouslySetInnerHTML={{ __html: song.lyrics }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SongItem;
