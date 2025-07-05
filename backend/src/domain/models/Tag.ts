import { ITag } from '../interfaces/Tags';

export class Tag implements ITag {
  public id?: string;
  public name: string;

  constructor(props: ITag) {
    this.id = props.id;
    this.name = props.name;
  }
}
