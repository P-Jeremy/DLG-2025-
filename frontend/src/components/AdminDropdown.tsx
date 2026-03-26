import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminDropdown.scss';

interface AdminDropdownProps {
  onNavigate: () => void;
  mobileExpanded: boolean;
}

const AdminDropdown: React.FC<AdminDropdownProps> = ({ onNavigate, mobileExpanded }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setOpen(false);
    onNavigate();
  };

  return (
    <div className="admin-dropdown" ref={ref}>
      <button
        className={`navbar__item navbar__item--button admin-dropdown__trigger${open || mobileExpanded ? ' is-open' : ''}`}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open || mobileExpanded}
        aria-haspopup="true"
      >
        Administration
        <span className="admin-dropdown__arrow" aria-hidden="true">▾</span>
      </button>

      <ul className={`admin-dropdown__menu${open || mobileExpanded ? ' admin-dropdown__menu--open' : ''}`} role="menu">
        <li role="none">
          <Link
            className="admin-dropdown__item"
            to="/songs/add"
            onClick={handleLinkClick}
            role="menuitem"
          >
            Ajouter une chanson
          </Link>
        </li>
        <li role="none">
          <Link
            className="admin-dropdown__item"
            to="/admin/tags"
            onClick={handleLinkClick}
            role="menuitem"
          >
            Gérer les tags
          </Link>
        </li>
        <li role="none">
          <Link
            className="admin-dropdown__item"
            to="/admin/playlists"
            onClick={handleLinkClick}
            role="menuitem"
          >
            Gérer les playlists
          </Link>
        </li>
        <li role="none">
          <Link
            className="admin-dropdown__item"
            to="/admin/users"
            onClick={handleLinkClick}
            role="menuitem"
          >
            Gérer les utilisateurs
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminDropdown;
