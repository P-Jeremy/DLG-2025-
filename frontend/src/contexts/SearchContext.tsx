import React, { createContext, useContext, useMemo, useState } from 'react';
import type { SortField } from '../types/song';

interface SearchContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  searchVisible: boolean;
  setSearchVisible: (visible: boolean) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('title');
  const [searchVisible, setSearchVisible] = useState(true);

  const value = useMemo(
    () => ({ searchQuery, setSearchQuery, sortField, setSortField, searchVisible, setSearchVisible }),
    [searchQuery, sortField, searchVisible],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch must be used within SearchProvider');
  return context;
}
