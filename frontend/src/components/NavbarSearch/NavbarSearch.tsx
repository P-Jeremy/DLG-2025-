import React from 'react';
import SortToggle from '../SortToggle';
import { useSearch } from '../../contexts/SearchContext';
import './NavbarSearch.scss';

const NavbarSearch: React.FC = () => {
  const { searchQuery, setSearchQuery, sortField, setSortField } = useSearch();

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
