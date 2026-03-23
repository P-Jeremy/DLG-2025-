import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SongList from '../components/SongList';
import { useAuth } from '../contexts/AuthContext';
import './MainLayout.scss';

const MainLayout: React.FC = () => {
  const { pseudo, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-bg">
      <header className="navbar">
        <div className="navbar__brand">DLG</div>

        <button
          className={`navbar__burger${menuOpen ? ' navbar__burger--open' : ''}`}
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(open => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar__menu${menuOpen ? ' navbar__menu--open' : ''}`}>
          {isAdmin && (
            <Link className="navbar__item" to="/admin/songs" onClick={closeMenu}>
              Administration
            </Link>
          )}
          {pseudo ? (
            <button
              className="navbar__item navbar__item--button"
              onClick={() => { logout(); closeMenu(); }}
            >
              Déconnexion ({pseudo})
            </button>
          ) : (
            <>
              <Link className="navbar__item" to="/login" onClick={closeMenu}>
                Connexion
              </Link>
              <Link className="navbar__item navbar__item--register" to="/register" onClick={closeMenu}>
                Inscription
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="app-content">
        <SongList />
      </main>
    </div>
  );
};

export default MainLayout;
