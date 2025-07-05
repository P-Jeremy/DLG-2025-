import { Tag } from '../models/Tag';

export interface ISong {
  id?: string;
  title: string;
  author: string;
  lyrics: string;
  tab: string;
  tags?: Tag[];
}
