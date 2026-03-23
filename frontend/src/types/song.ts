export interface Song {
  id: string;
  title: string;
  author?: string;
  lyrics?: string;
  tab?: string;
  tags?: { id?: string; name: string }[];
}

export type SortField = 'title' | 'author';
