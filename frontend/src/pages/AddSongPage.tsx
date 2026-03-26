import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAuth } from '../contexts/AuthContext';
import { addSong } from '../api/songs';
import { fetchTags } from '../api/tags';
import type { Tag } from '../api/tags';
import RichTextToolbar from '../components/RichTextToolbar';
import AppBackground from '../components/AppBackground';
import Navbar from '../components/Navbar';
import './AddSongPage.scss';

const AddSongPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [tabFile, setTabFile] = useState<File | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  });

  useEffect(() => {
    fetchTags()
      .then(setAvailableTags)
      .catch(() => {});
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? [] : [tagId],
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setTabFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    if (!title.trim()) return;

    if (!tabFile) {
      setError('Veuillez sélectionner une image pour la tablature.');
      return;
    }

    if (!token) {
      setError('Vous devez être connecté.');
      return;
    }

    const lyrics = editor?.getHTML() ?? '';
    if (!lyrics || lyrics === '<p></p>') {
      setError('Les paroles sont requises.');
      return;
    }

    setLoading(true);
    try {
      await addSong({ title, author, lyrics, tab: tabFile, selectedTags: selectedTagIds }, token);
      setSuccess(true);
      setSubmitted(false);
      setTitle('');
      setAuthor('');
      setTabFile(null);
      setSelectedTagIds([]);
      editor?.commands.setContent('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <AppBackground>
        <Navbar />
        <div className="add-song-page">
          <div className="add-song-forbidden">Accès réservé aux administrateurs.</div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
    <Navbar />
    <div className="add-song-page">
      <div className="add-song-card">
        <h1 className="add-song-title">Ajouter une chanson</h1>

        {error && <div className="add-song-error">{error}</div>}
        {success && (
          <div className="add-song-success">
            Chanson ajoutée avec succès !{' '}
            <button className="add-song-link-button" onClick={() => void navigate('/')}>
              Retour à la liste
            </button>
          </div>
        )}

        <form className="add-song-form" onSubmit={handleSubmit} noValidate>
          <div className="add-song-field">
            <label htmlFor="title" className="add-song-label--required">Titre</label>
            <input
              id="title"
              className={`add-song-input${submitted && !title.trim() ? ' add-song-input--error' : ''}`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            {submitted && !title.trim() && (
              <span className="add-song-field-error">Le titre est requis.</span>
            )}
          </div>

          <div className="add-song-field">
            <label htmlFor="author">Artiste</label>
            <input
              id="author"
              className="add-song-input"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="add-song-field">
            <label>Paroles</label>
            <div className="add-song-editor">
              <RichTextToolbar editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </div>

          <div className="add-song-field">
            <label htmlFor="tab">Tablature (image PNG/JPG, 2Mo max)</label>
            <input
              id="tab"
              className="add-song-input"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>

          {availableTags.length > 0 && (
            <div className="add-song-field">
              <label>Tags</label>
              <div className="add-song-tags">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`add-song-tag${selectedTagIds.includes(tag.id) ? ' add-song-tag--selected' : ''}`}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="add-song-actions">
            <button
              className="add-song-cancel"
              type="button"
              onClick={() => void navigate('/')}
              disabled={loading}
            >
              Annuler
            </button>
            <button className="add-song-submit" type="submit" disabled={loading}>
              {loading ? 'Envoi en cours...' : 'Ajouter la chanson'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </AppBackground>
  );
};

export default AddSongPage;
