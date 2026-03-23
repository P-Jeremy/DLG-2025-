import bcrypt from 'bcryptjs';
import { RegisterUser, EmailAlreadyTakenError, PseudoAlreadyTakenError } from '../../src/domain/usecases/RegisterUser';
import { LoginUser, UserNotFoundError, AccountNotActiveError, InvalidPasswordError } from '../../src/domain/usecases/LoginUser';
import { ActivateAccount, InvalidActivationTokenError } from '../../src/domain/usecases/ActivateAccount';
import { RequestPasswordReset } from '../../src/domain/usecases/RequestPasswordReset';
import { ResetPassword, InvalidResetTokenError } from '../../src/domain/usecases/ResetPassword';
import { UpdateNotificationPreferences } from '../../src/domain/usecases/UpdateNotificationPreferences';
import { UserMongoRepository } from '../../src/infrastructure/repositories/userRepository';
import type { IEmailService } from '../../src/domain/interfaces/IEmailService';
import type { IJwtService, JwtPayload } from '../../src/domain/interfaces/IJwtService';

const buildMockEmailService = (): IEmailService => ({
  sendActivationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendNewSongNotification: jest.fn().mockResolvedValue(undefined),
});

const buildMockJwtService = (): IJwtService => ({
  generateToken: jest.fn().mockReturnValue('jwt-token'),
  verifyToken: jest.fn().mockReturnValue({} as JwtPayload),
});

describe('Auth use cases integration tests', () => {
  let userRepository: UserMongoRepository;

  beforeAll(() => {
    userRepository = new UserMongoRepository();
  });

  describe('RegisterUser', () => {
    it('should register a new user in the database', async () => {
      const emailService = buildMockEmailService();
      const usecase = new RegisterUser(userRepository, emailService);

      const result = await usecase.execute({ email: 'register@example.com', pseudo: 'registeruser', password: 'password123' });

      expect(result.userId).toBeTruthy();
      const saved = await userRepository.findByEmail('register@example.com');
      expect(saved).not.toBeNull();
      expect(saved!.isActive).toBe(false);
      expect(saved!.tokens).toHaveLength(1);
    });

    it('should throw EmailAlreadyTakenError for duplicate email', async () => {
      const emailService = buildMockEmailService();
      const usecase = new RegisterUser(userRepository, emailService);
      await usecase.execute({ email: 'duplicate@example.com', pseudo: 'user1', password: 'pass' });

      await expect(
        usecase.execute({ email: 'duplicate@example.com', pseudo: 'user2', password: 'pass' }),
      ).rejects.toThrow(EmailAlreadyTakenError);
    });

    it('should throw PseudoAlreadyTakenError for duplicate pseudo', async () => {
      const emailService = buildMockEmailService();
      const usecase = new RegisterUser(userRepository, emailService);
      await usecase.execute({ email: 'user3@example.com', pseudo: 'dupseudo', password: 'pass' });

      await expect(
        usecase.execute({ email: 'user4@example.com', pseudo: 'dupseudo', password: 'pass' }),
      ).rejects.toThrow(PseudoAlreadyTakenError);
    });
  });

  describe('ActivateAccount', () => {
    it('should activate user account when token is valid', async () => {
      const emailService = buildMockEmailService();
      const registerUsecase = new RegisterUser(userRepository, emailService);
      await registerUsecase.execute({ email: 'activate@example.com', pseudo: 'activateuser', password: 'pass' });

      const user = await userRepository.findByEmail('activate@example.com');
      const token = user!.tokens[0].used_token;

      const activateUsecase = new ActivateAccount(userRepository);
      const result = await activateUsecase.execute({ token });

      expect(result.success).toBe(true);
      const activated = await userRepository.findByEmail('activate@example.com');
      expect(activated!.isActive).toBe(true);
      expect(activated!.tokens).toHaveLength(0);
    });

    it('should throw InvalidActivationTokenError for invalid token', async () => {
      const usecase = new ActivateAccount(userRepository);

      await expect(usecase.execute({ token: 'invalid-token' })).rejects.toThrow(InvalidActivationTokenError);
    });
  });

  describe('LoginUser', () => {
    it('should return token and user info on valid login', async () => {
      const emailService = buildMockEmailService();
      const registerUsecase = new RegisterUser(userRepository, emailService);
      await registerUsecase.execute({ email: 'login@example.com', pseudo: 'loginuser', password: 'mypassword' });

      const user = await userRepository.findByEmail('login@example.com');
      const token = user!.tokens[0].used_token;
      const activateUsecase = new ActivateAccount(userRepository);
      await activateUsecase.execute({ token });

      const jwtService = buildMockJwtService();
      const loginUsecase = new LoginUser(userRepository, jwtService);
      const result = await loginUsecase.execute({ email: 'login@example.com', password: 'mypassword' });

      expect(result.token).toBe('jwt-token');
      expect(result.pseudo).toBe('loginuser');
      expect(result.isAdmin).toBe(false);
    });

    it('should throw AccountNotActiveError for non-activated account', async () => {
      const emailService = buildMockEmailService();
      const registerUsecase = new RegisterUser(userRepository, emailService);
      await registerUsecase.execute({ email: 'inactive@example.com', pseudo: 'inactiveuser', password: 'pass' });

      const jwtService = buildMockJwtService();
      const loginUsecase = new LoginUser(userRepository, jwtService);

      await expect(
        loginUsecase.execute({ email: 'inactive@example.com', password: 'pass' }),
      ).rejects.toThrow(AccountNotActiveError);
    });

    it('should throw InvalidPasswordError for wrong password', async () => {
      const emailService = buildMockEmailService();
      const registerUsecase = new RegisterUser(userRepository, emailService);
      await registerUsecase.execute({ email: 'wrongpass@example.com', pseudo: 'wrongpassuser', password: 'correct' });

      const user = await userRepository.findByEmail('wrongpass@example.com');
      const activateUsecase = new ActivateAccount(userRepository);
      await activateUsecase.execute({ token: user!.tokens[0].used_token });

      const jwtService = buildMockJwtService();
      const loginUsecase = new LoginUser(userRepository, jwtService);

      await expect(
        loginUsecase.execute({ email: 'wrongpass@example.com', password: 'wrong' }),
      ).rejects.toThrow(InvalidPasswordError);
    });

    it('should throw UserNotFoundError for non-existent user', async () => {
      const jwtService = buildMockJwtService();
      const loginUsecase = new LoginUser(userRepository, jwtService);

      await expect(
        loginUsecase.execute({ email: 'ghost@example.com', password: 'pass' }),
      ).rejects.toThrow(UserNotFoundError);
    });
  });

  describe('RequestPasswordReset', () => {
    it('should push a reset token to user tokens array', async () => {
      const emailService = buildMockEmailService();
      const registerUsecase = new RegisterUser(userRepository, emailService);
      await registerUsecase.execute({ email: 'reset@example.com', pseudo: 'resetuser', password: 'pass' });

      const user = await userRepository.findByEmail('reset@example.com');
      const activateUsecase = new ActivateAccount(userRepository);
      await activateUsecase.execute({ token: user!.tokens[0].used_token });

      const resetEmailService = buildMockEmailService();
      const resetUsecase = new RequestPasswordReset(userRepository, resetEmailService);
      const result = await resetUsecase.execute({ email: 'reset@example.com' });

      expect(result.success).toBe(true);
      const updated = await userRepository.findByEmail('reset@example.com');
      expect(updated!.tokens).toHaveLength(1);
      expect(resetEmailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should return success even for non-existent email', async () => {
      const emailService = buildMockEmailService();
      const usecase = new RequestPasswordReset(userRepository, emailService);

      const result = await usecase.execute({ email: 'nobody@example.com' });

      expect(result.success).toBe(true);
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('ResetPassword', () => {
    it('should update password and clear tokens', async () => {
      const emailService = buildMockEmailService();
      const registerUsecase = new RegisterUser(userRepository, emailService);
      await registerUsecase.execute({ email: 'newpass@example.com', pseudo: 'newpassuser', password: 'oldpassword' });

      const user = await userRepository.findByEmail('newpass@example.com');
      const token = user!.tokens[0].used_token;

      const resetUsecase = new ResetPassword(userRepository);
      const result = await resetUsecase.execute({ token, newPassword: 'newpassword' });

      expect(result.success).toBe(true);
      const updated = await userRepository.findByEmail('newpass@example.com');
      expect(updated!.tokens).toHaveLength(0);
      const passwordMatches = await bcrypt.compare('newpassword', updated!.password.toString());
      expect(passwordMatches).toBe(true);
    });

    it('should throw InvalidResetTokenError for invalid token', async () => {
      const usecase = new ResetPassword(userRepository);

      await expect(
        usecase.execute({ token: 'bad-token', newPassword: 'newpass' }),
      ).rejects.toThrow(InvalidResetTokenError);
    });
  });

  describe('UpdateNotificationPreferences', () => {
    it('should update titleNotif preference', async () => {
      const emailService = buildMockEmailService();
      const registerUsecase = new RegisterUser(userRepository, emailService);
      const { userId } = await registerUsecase.execute({ email: 'notif@example.com', pseudo: 'notifuser', password: 'pass' });

      const usecase = new UpdateNotificationPreferences(userRepository);
      const result = await usecase.execute({ userId, titleNotif: false });

      expect(result.titleNotif).toBe(false);
      const updated = await userRepository.findById(userId);
      expect(updated!.titleNotif).toBe(false);
    });
  });
});
