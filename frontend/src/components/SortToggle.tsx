import React from 'react';
import type { SortField } from '../types/song';
import './SortToggle.scss';

interface SortToggleProps {
  sortField: SortField;
  onToggle: (field: SortField) => void;
}

const SortToggle: React.FC<SortToggleProps> = ({ sortField, onToggle }) => {
  const isChecked = sortField === 'author';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(event.target.checked ? 'author' : 'title');
  };

  return (
    <label className="sort-toggle" aria-label="Trier par">
      <input
        type="checkbox"
        className="sort-toggle__input"
        checked={isChecked}
        onChange={handleChange}
        aria-label="Trier par artiste"
      />
      <span
        className={`sort-toggle__label sort-toggle__label--left${!isChecked ? ' sort-toggle__label--active' : ''}`}
        aria-label="Sort by title"
        onClick={() => onToggle('title')}
      >
        <span className="material-icons sort-toggle__icon">audiotrack</span>
      </span>
      <span className="sort-toggle__track">
        <span className="sort-toggle__thumb" />
      </span>
      <span
        className={`sort-toggle__label sort-toggle__label--right${isChecked ? ' sort-toggle__label--active' : ''}`}
        aria-label="Sort by artist"
        onClick={() => onToggle('author')}
      >
        <span className="material-icons sort-toggle__icon">perm_identity</span>
      </span>
    </label>
  );
};

export default SortToggle;
