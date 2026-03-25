import type { IPlaylist } from '../interfaces/IPlaylist';

export class Playlist implements IPlaylist {
  public id?: string;
  public tagId: string;
  public songIds: string[];

  constructor(props: IPlaylist) {
    this.id = props.id;
    this.tagId = props.tagId;
    this.songIds = props.songIds;
  }
}
