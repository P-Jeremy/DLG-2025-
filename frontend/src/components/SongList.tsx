import React, { useCallback, useEffect, useState } from 'react';
import SongItem from './SongItem';
import SortToggle from './SortToggle';
import TagFilter from './TagFilter';
import { fetchSongs, fetchSongsByTag } from '../api/songs';
import { fetchTags } from '../api/tags';
import { useSocket } from '../hooks/useSocket';
import type { Song, SortField } from '../types/song';
import type { Tag } from '../api/tags';
import './SongList.scss';

const REFRESH_EVENT = 'refresh';

const SongList: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('title');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  useEffect(() => {
    fetchTags()
      .then(setTags)
      .catch(() => {});
  }, []);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = selectedTagId
        ? await fetchSongsByTag(selectedTagId)
        : await fetchSongs(sortField);
      setSongs(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [sortField, selectedTagId]);

  useEffect(() => {
    void loadSongs();
  }, [loadSongs]);

  const handleRefresh = useCallback(() => {
    void loadSongs();
  }, [loadSongs]);

  useSocket(REFRESH_EVENT, handleRefresh);

  if (loading) return <div className="song-list-bg"><img src="/vinyl.png" className="vinyl-loader" alt="Chargement..." /></div>;
  if (error) return <div className="song-list-bg"><div className="song-list-error">Erreur : {error}</div></div>;

  return (
    <div className="song-list-bg">
      <div className="song-list-controls">
        {tags.length > 0 && (
          <TagFilter
            tags={tags}
            selectedTagId={selectedTagId}
            onSelect={setSelectedTagId}
          />
        )}
        {!selectedTagId && (
          <SortToggle sortField={sortField} onToggle={setSortField} />
        )}
      </div>
      {songs.length === 0 ? (
        <div className="song-list-message">Aucune chanson trouvée.</div>
      ) : (
        <div className="song-list">
          {songs.map(song => (
            <SongItem key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SongList;
