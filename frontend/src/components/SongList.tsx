import React, { useEffect, useState } from 'react';
import SongItem from './SongItem';
import './SongList.css';

export interface Song {
  _id: string;
  title: string;
  author?: string;
  lyrics?: string;
  tab?: string;
  tags?: { id?: string; name: string }[];
}

const SongList: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/songs');
        if (!res.ok) throw new Error('Erreur lors du chargement des chansons');
        const data = await res.json();
        setSongs(data as Song[]);
      } catch (err: any) {
        setError((err as Error).message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };
    void fetchSongs();
  }, []);

  if (loading) return <div className="song-list-bg"><div style={{textAlign:'center'}}>Chargement...</div></div>;
  if (error) return <div className="song-list-bg"><div style={{color: 'red', textAlign:'center'}}>Erreur : {error}</div></div>;
  if (songs.length === 0) return <div className="song-list-bg"><div style={{textAlign:'center'}}>Aucune chanson trouvée.</div></div>;

  return (
    <div className="song-list-bg">
      <div className="song-list">
        {songs.map(song => (
          <SongItem key={song._id} song={song} />
        ))}
      </div>
    </div>
  );
};

export default SongList;
