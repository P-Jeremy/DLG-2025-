import React from 'react';
import type { Tag } from '../api/tags';
import './TagFilter.scss';

interface TagFilterProps {
  tags: Tag[];
  selectedTagId: string | null;
  onSelect: (tagId: string | null) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTagId, onSelect }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSelect(value === '' ? null : value);
  };

  return (
    <div className="tag-filter">
      <label htmlFor="tag-filter-select" className="tag-filter__label">
        Playlist
      </label>
      <div className="tag-filter__select-wrapper">
        <select
          id="tag-filter-select"
          className="tag-filter__select"
          value={selectedTagId ?? ''}
          onChange={handleChange}
        >
          <option value="">Toutes les chansons</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TagFilter;
