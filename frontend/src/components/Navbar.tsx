import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminDropdown from './AdminDropdown';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.scss';

const Navbar: React.FC = () => {
  const { pseudo, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <Link className="navbar__brand" to="/">DLG</Link>

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
          <AdminDropdown onNavigate={closeMenu} mobileExpanded={menuOpen} />
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
  );
};

export default Navbar;
