import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAuth } from '../contexts/AuthContext';
import { updateSong, fetchSongs } from '../api/songs';
import { getErrorMessage } from '../utils/errorHandling';
import type { Song } from '../types/song';
import RichTextToolbar from '../components/RichTextToolbar';
import AppBackground from '../components/AppBackground';
import Navbar from '../components/Navbar';
import VinylLoader from '../components/VinylLoader';
import './EditSongPage.scss';

const EditSongPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();

  const [song, setSong] = useState<Song | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [tabFile, setTabFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  });

  const editorRef = useRef(editor);
  editorRef.current = editor;

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoadingData(true);
      try {
        const songs = await fetchSongs('title');
        const found = songs.find((s) => s.id === id) ?? null;
        setSong(found);

        if (found) {
          setTitle(found.title);
          setAuthor(found.author ?? '');
          if (editorRef.current && found.lyrics) {
            editorRef.current.commands.setContent(found.lyrics);
          }
        }
      } catch {
        setError('Impossible de charger les données de la chanson.');
      } finally {
        setLoadingData(false);
      }
    };

    void loadData();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setTabFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    if (!title.trim()) return;
    if (!token) {
      setError('Vous devez être connecté.');
      return;
    }
    if (!id) return;

    const lyrics = editor?.getHTML() ?? '';
    if (!lyrics || lyrics === '<p></p>') {
      setError('Les paroles sont requises.');
      return;
    }

    setLoading(true);
    try {
      await updateSong(
        id,
        { title, author, lyrics, tab: tabFile ?? undefined },
        token,
      );
      setSuccess(true);
      setSubmitted(false);
      setTabFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <AppBackground>
        <Navbar />
        <div className="edit-song-page">
          <div className="edit-song-forbidden">Accès réservé aux administrateurs.</div>
        </div>
      </AppBackground>
    );
  }

  if (loadingData) {
    return (
      <AppBackground>
        <Navbar />
        <div className="edit-song-page">
          <VinylLoader />
        </div>
      </AppBackground>
    );
  }

  if (!song) {
    return (
      <AppBackground>
        <Navbar />
        <div className="edit-song-page">
          <div className="edit-song-not-found">Chanson introuvable.</div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <Navbar />
      <div className="edit-song-page">
        <div className="edit-song-card">
          <h1 className="edit-song-title">Modifier une chanson</h1>

          {error && <div className="edit-song-error">{error}</div>}
          {success && (
            <div className="edit-song-success">
              Chanson modifiée avec succès !{' '}
              <button className="edit-song-link-button" onClick={() => void navigate('/')}>
                Retour à la liste
              </button>
            </div>
          )}

          <form className="edit-song-form" onSubmit={handleSubmit} noValidate>
            <div className="edit-song-field">
              <label htmlFor="title" className="edit-song-label--required">Titre</label>
              <input
                id="title"
                className={`edit-song-input${submitted && !title.trim() ? ' edit-song-input--error' : ''}`}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {submitted && !title.trim() && (
                <span className="edit-song-field-error">Le titre est requis.</span>
              )}
            </div>

            <div className="edit-song-field">
              <label htmlFor="author">Artiste</label>
              <input
                id="author"
                className="edit-song-input"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div className="edit-song-field">
              <label>Paroles</label>
              <div className="edit-song-editor">
                <RichTextToolbar editor={editor} />
                <EditorContent editor={editor} />
              </div>
            </div>

            <div className="edit-song-field">
              <label htmlFor="tab">Nouvelle tablature (optionnel — PNG/JPG, 2Mo max)</label>
              {song.tab && (
                <div className="edit-song-current-tab">
                  <img src={song.tab} alt="Tablature actuelle" className="edit-song-current-tab-img" />
                  <span className="edit-song-current-tab-label">Tablature actuelle</span>
                </div>
              )}
              <input
                id="tab"
                className="edit-song-input"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </div>

            <div className="edit-song-actions">
              <button
                className="edit-song-cancel"
                type="button"
                onClick={() => void navigate('/')}
                disabled={loading}
              >
                Annuler
              </button>
              <button className="edit-song-submit" type="submit" disabled={loading}>
                {loading ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppBackground>
  );
};

export default EditSongPage;
