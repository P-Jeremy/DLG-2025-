import React from 'react';
import type { Editor } from '@tiptap/react';
import '../styles/_rich-text-toolbar.scss';

interface RichTextToolbarProps {
  editor: Editor | null;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editor }) => (
  <div className="rich-text-toolbar">
    <button
      type="button"
      className={`rich-text-toolbar-btn${editor?.isActive('bold') ? ' is-active' : ''}`}
      onClick={() => editor?.chain().focus().toggleBold().run()}
      title="Gras"
    >
      <strong>B</strong>
    </button>
    <button
      type="button"
      className={`rich-text-toolbar-btn${editor?.isActive('italic') ? ' is-active' : ''}`}
      onClick={() => editor?.chain().focus().toggleItalic().run()}
      title="Italique"
    >
      <em>I</em>
    </button>
    <button
      type="button"
      className={`rich-text-toolbar-btn${editor?.isActive('strike') ? ' is-active' : ''}`}
      onClick={() => editor?.chain().focus().toggleStrike().run()}
      title="Barré"
    >
      <s>S</s>
    </button>
    <span className="rich-text-toolbar-separator" />
    <button
      type="button"
      className={`rich-text-toolbar-btn${editor?.isActive('bulletList') ? ' is-active' : ''}`}
      onClick={() => editor?.chain().focus().toggleBulletList().run()}
      title="Liste à puces"
    >
      ≡
    </button>
    <button
      type="button"
      className={`rich-text-toolbar-btn${editor?.isActive('orderedList') ? ' is-active' : ''}`}
      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      title="Liste numérotée"
    >
      1.
    </button>
    <span className="rich-text-toolbar-separator" />
    <button
      type="button"
      className="rich-text-toolbar-btn"
      onClick={() => editor?.chain().focus().undo().run()}
      title="Annuler"
    >
      ↩
    </button>
    <button
      type="button"
      className="rich-text-toolbar-btn"
      onClick={() => editor?.chain().focus().redo().run()}
      title="Rétablir"
    >
      ↪
    </button>
  </div>
);

export default RichTextToolbar;
