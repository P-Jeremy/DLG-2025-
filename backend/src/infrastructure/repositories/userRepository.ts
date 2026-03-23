import { UserModel, UserDocument } from '../models/userModel';
import { User } from '../../domain/models/User';
import { Email } from '../../domain/value-objects/Email';
import { Pseudo } from '../../domain/value-objects/Pseudo';
import { HashedPassword } from '../../domain/value-objects/HashedPassword';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';

export class UserMongoRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByPseudo(pseudo: string): Promise<User | null> {
    const doc = await UserModel.findOne({ pseudo }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByResetToken(token: string): Promise<User | null> {
    const doc = await UserModel.findOne({ 'tokens.used_token': token }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async save(user: User): Promise<User> {
    const doc = new UserModel({
      email: user.email.toString(),
      pseudo: user.pseudo.toString(),
      password: user.password.toString(),
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      isDeleted: user.isDeleted,
      titleNotif: user.titleNotif,
      tokens: user.tokens,
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(user: User): Promise<User> {
    const updated = await UserModel.findByIdAndUpdate(
      user.id,
      {
        email: user.email.toString(),
        pseudo: user.pseudo.toString(),
        password: user.password.toString(),
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        isDeleted: user.isDeleted,
        titleNotif: user.titleNotif,
        tokens: user.tokens,
      },
      { new: true },
    ).exec();

    if (!updated) {
      throw new Error(`User with id ${user.id} not found for update`);
    }

    return this.toDomain(updated);
  }

  private toDomain(doc: UserDocument): User {
    return new User({
      id: doc._id.toString(),
      email: new Email(doc.email),
      pseudo: new Pseudo(doc.pseudo),
      password: new HashedPassword(doc.password),
      isAdmin: doc.isAdmin,
      isActive: doc.isActive,
      isDeleted: doc.isDeleted,
      titleNotif: doc.titleNotif,
      tokens: doc.tokens,
    });
  }
}
