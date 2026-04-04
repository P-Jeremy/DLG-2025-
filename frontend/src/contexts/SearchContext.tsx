import React, { createContext, useContext, useMemo, useState } from 'react';

interface SearchContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchVisible: boolean;
  setSearchVisible: (visible: boolean) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(true);

  const value = useMemo(
    () => ({ searchQuery, setSearchQuery, searchVisible, setSearchVisible }),
    [searchQuery, searchVisible],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch must be used within SearchProvider');
  return context;
}
