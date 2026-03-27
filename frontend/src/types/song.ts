export interface Song {
  id: string;
  title: string;
  author?: string;
  lyrics?: string;
  tab?: string;
}

export type SortField = 'title' | 'author';
