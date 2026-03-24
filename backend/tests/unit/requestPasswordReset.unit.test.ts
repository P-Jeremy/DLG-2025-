import { RequestPasswordReset } from '../../src/application/usecases/RequestPasswordReset';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
import type { IEmailService } from '../../src/domain/interfaces/IEmailService';
import { User } from '../../src/domain/models/User';
import { Email } from '../../src/domain/value-objects/Email';
import { Pseudo } from '../../src/domain/value-objects/Pseudo';
import { HashedPassword } from '../../src/domain/value-objects/HashedPassword';

const buildActiveUser = (): User =>
  new User({
    id: 'user-id-1',
    email: new Email('user@example.com'),
    pseudo: new Pseudo('john'),
    password: new HashedPassword('hashed-password'),
    isAdmin: false,
    isActive: true,
    isDeleted: false,
    titleNotif: true,
    tokens: [],
  });

const buildMockUserRepository = (overrides: Partial<IUserRepository> = {}): IUserRepository => ({
  findByEmail: jest.fn().mockResolvedValue(null),
  findByPseudo: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findByResetToken: jest.fn().mockResolvedValue(null),
  findAllWithTitleNotif: jest.fn().mockResolvedValue([]),
  save: jest.fn(),
  update: jest.fn().mockResolvedValue(null),
  ...overrides,
});

const buildMockEmailService = (overrides: Partial<IEmailService> = {}): IEmailService => ({
  sendActivationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendNewSongNotification: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('RequestPasswordReset use case', () => {
  it('should add a reset token to the user and send a reset email', async () => {
    const user = buildActiveUser();
    const repository = buildMockUserRepository({
      findByEmail: jest.fn().mockResolvedValue(user),
    });
    const emailService = buildMockEmailService();
    const usecase = new RequestPasswordReset(repository, emailService);

    const result = await usecase.execute({ email: 'user@example.com' });

    expect(result.success).toBe(true);
    expect(user.tokens).toHaveLength(1);
    expect(user.tokens[0].used_token).toBeTruthy();
    expect(repository.update).toHaveBeenCalledWith(user);
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      'user@example.com',
      user.tokens[0].used_token,
    );
  });

  it('should return success without sending email when user does not exist', async () => {
    const repository = buildMockUserRepository({
      findByEmail: jest.fn().mockResolvedValue(null),
    });
    const emailService = buildMockEmailService();
    const usecase = new RequestPasswordReset(repository, emailService);

    const result = await usecase.execute({ email: 'ghost@example.com' });

    expect(result.success).toBe(true);
    expect(repository.update).not.toHaveBeenCalled();
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('should return success without sending email when user is deleted', async () => {
    const user = buildActiveUser();
    user.isDeleted = true;
    const repository = buildMockUserRepository({
      findByEmail: jest.fn().mockResolvedValue(user),
    });
    const emailService = buildMockEmailService();
    const usecase = new RequestPasswordReset(repository, emailService);

    const result = await usecase.execute({ email: 'user@example.com' });

    expect(result.success).toBe(true);
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('should return success even when email sending fails', async () => {
    const user = buildActiveUser();
    const repository = buildMockUserRepository({
      findByEmail: jest.fn().mockResolvedValue(user),
    });
    const emailService = buildMockEmailService({
      sendPasswordResetEmail: jest.fn().mockRejectedValue(new Error('SMTP error')),
    });
    const usecase = new RequestPasswordReset(repository, emailService);

    const result = await usecase.execute({ email: 'user@example.com' });

    expect(result.success).toBe(true);
  });
});
