import { ISong } from '../interfaces/Song';
import { ITag } from '../interfaces/Tags';

export class Song implements ISong {
  public id?: string;
  public title: string;
  public author: string;
  public lyrics: string;
  public tab: string;
  public tags?: ITag[];

  constructor(props: ISong) {
    this.id = props.id;
    this.title = props.title;
    this.author = props.author;
    this.lyrics = props.lyrics;
    this.tab = props.tab;
    this.tags = props.tags;
  }
}
