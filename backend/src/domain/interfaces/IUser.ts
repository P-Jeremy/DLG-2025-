export interface IUser {
  id?: string;
  email: string;
  pseudo: string;
  password: string;
  isAdmin: boolean;
  isActive: boolean;
  isDeleted: boolean;
  titleNotif: boolean;
  tokens: { used_token: string }[];
}
