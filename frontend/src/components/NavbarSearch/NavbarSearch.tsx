import React from 'react';
import { useLocation } from 'react-router-dom';
import SortToggle from '../SortToggle';
import { useSearch } from '../../contexts/SearchContext';
import './NavbarSearch.scss';

const HIDDEN_PATHS = ['/songs/', '/admin/'];

const NavbarSearch: React.FC = () => {
  const { searchQuery, setSearchQuery, sortField, setSortField, searchVisible } = useSearch();
  const { pathname } = useLocation();

  const hiddenByRoute = HIDDEN_PATHS.some((prefix) => pathname.startsWith(prefix));

  if (!searchVisible || hiddenByRoute) return null;

  return (
    <div className="navbar-search">
      <input
        className="navbar-search__input"
        type="search"
        placeholder="Rechercher…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Rechercher une chanson"
      />
      <div className="navbar-search__sort">
        <SortToggle sortField={sortField} onToggle={setSortField} />
      </div>
    </div>
  );
};

export default NavbarSearch;
