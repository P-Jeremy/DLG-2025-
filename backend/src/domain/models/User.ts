import { Email } from '../value-objects/Email';
import { Pseudo } from '../value-objects/Pseudo';
import { HashedPassword } from '../value-objects/HashedPassword';

export class User {
  id?: string;
  email: Email;
  pseudo: Pseudo;
  password: HashedPassword;
  isAdmin: boolean;
  isActive: boolean;
  isDeleted: boolean;
  titleNotif: boolean;
  tokens: { used_token: string }[];

  constructor(props: {
    id?: string;
    email: Email;
    pseudo: Pseudo;
    password: HashedPassword;
    isAdmin: boolean;
    isActive: boolean;
    isDeleted: boolean;
    titleNotif: boolean;
    tokens: { used_token: string }[];
  }) {
    this.id = props.id;
    this.email = props.email;
    this.pseudo = props.pseudo;
    this.password = props.password;
    this.isAdmin = props.isAdmin;
    this.isActive = props.isActive;
    this.isDeleted = props.isDeleted;
    this.titleNotif = props.titleNotif;
    this.tokens = props.tokens;
  }
}
