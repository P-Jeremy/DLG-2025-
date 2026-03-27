import type { IPlaylist } from '../interfaces/IPlaylist';

export class Playlist implements IPlaylist {
  public id?: string;
  public name: string;
  public songIds: string[];

  constructor(props: IPlaylist) {
    this.id = props.id;
    this.name = props.name;
    this.songIds = props.songIds;
  }
}
