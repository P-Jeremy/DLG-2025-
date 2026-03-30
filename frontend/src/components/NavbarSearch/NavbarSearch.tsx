import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import SortToggle from '../SortToggle';
import { useSearch } from '../../contexts/SearchContext';
import './NavbarSearch.scss';

const HIDDEN_PATHS = ['/songs/', '/admin/'];

const NavbarSearch: React.FC = () => {
  const { searchQuery, setSearchQuery, sortField, setSortField, searchVisible } = useSearch();
  const { pathname } = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const isHidden = !searchVisible || HIDDEN_PATHS.some((prefix) => pathname.startsWith(prefix));

  const handleInputFocus = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`navbar-search${isHidden ? ' navbar-search--hidden' : ''}`} aria-hidden={isHidden}>
      <input
        ref={inputRef}
        className="navbar-search__input"
        type="search"
        placeholder="Rechercher…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onMouseDown={handleInputFocus}
        onTouchEnd={handleInputFocus}
        onKeyDown={handleKeyDown}
        tabIndex={isHidden ? -1 : 0}
        aria-label="Rechercher une chanson"
      />
      <div className="navbar-search__sort">
        <SortToggle sortField={sortField} onToggle={setSortField} />
      </div>
    </div>
  );
};

export default NavbarSearch;
