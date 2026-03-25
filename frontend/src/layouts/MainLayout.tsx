import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SongList from '../components/SongList';
import AdminDropdown from '../components/AdminDropdown';
import { useAuth } from '../contexts/AuthContext';
import './MainLayout.scss';

const MainLayout: React.FC = () => {
  const { pseudo, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const parallaxBgRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        if (parallaxBgRef.current) {
          const offset = window.scrollY * 0.2;
          parallaxBgRef.current.style.backgroundPositionY = `calc(50% + ${offset}px)`;
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-bg">
      <div className="app-parallax-bg" ref={parallaxBgRef} />
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

      <main className="app-content">
        <SongList />
      </main>
    </div>
  );
};

export default MainLayout;
