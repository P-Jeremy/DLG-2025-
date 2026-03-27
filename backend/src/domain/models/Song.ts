import { ISong } from '../interfaces/Song';

export class Song implements ISong {
  public id?: string;
  public title: string;
  public author: string;
  public lyrics: string;
  public tab: string;

  constructor(props: ISong) {
    this.id = props.id;
    this.title = props.title;
    this.author = props.author;
    this.lyrics = props.lyrics;
    this.tab = props.tab;
  }
}
