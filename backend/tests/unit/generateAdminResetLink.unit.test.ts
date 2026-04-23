import { GenerateAdminResetLink } from '../../src/application/usecases/GenerateAdminResetLink';
import { UserNotFoundError } from '../../src/domain/errors/DomainError';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
import type { ITokenRepository } from '../../src/domain/interfaces/ITokenRepository';
import type { Token } from '../../src/domain/models/Token';
import type { User } from '../../src/domain/models/User';

const MOCK_USER = { id: 'user-1', isDeleted: false } as User;

const buildMockUserRepository = (user: User | null = MOCK_USER): IUserRepository => ({
  findByEmail: jest.fn(),
  findByPseudo: jest.fn(),
  findById: jest.fn().mockResolvedValue(user),
  findAll: jest.fn(),
  setAdminRole: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const buildMockTokenRepository = (): ITokenRepository => ({
  save: jest.fn().mockImplementation((t: Token) => Promise.resolve({ ...t, id: 'token-id' })),
  findByHash: jest.fn().mockResolvedValue(null),
  invalidatePreviousTokens: jest.fn().mockResolvedValue(undefined),
  markAsUsed: jest.fn().mockResolvedValue(undefined),
});

describe('GenerateAdminResetLink use case', () => {
  it('returns a reset link containing the raw token', async () => {
    const usecase = new GenerateAdminResetLink(buildMockUserRepository(), buildMockTokenRepository());
    const result = await usecase.execute({ userId: 'user-1', clientUrl: 'https://app.com' });

    expect(result.resetLink).toContain('https://app.com/reset-password/');
    expect(result.resetLink.split('/').pop()).toHaveLength(64);
  });

  it('invalidates previous RESET_PASSWORD tokens before creating new one', async () => {
    const tokenRepository = buildMockTokenRepository();
    const usecase = new GenerateAdminResetLink(buildMockUserRepository(), tokenRepository);

    await usecase.execute({ userId: 'user-1', clientUrl: 'https://app.com' });

    expect(tokenRepository.invalidatePreviousTokens).toHaveBeenCalledWith('user-1', 'RESET_PASSWORD');
  });

  it('saves a hashed token (not raw) in repository', async () => {
    const tokenRepository = buildMockTokenRepository();
    const usecase = new GenerateAdminResetLink(buildMockUserRepository(), tokenRepository);

    const result = await usecase.execute({ userId: 'user-1', clientUrl: 'https://app.com' });
    const rawToken = result.resetLink.split('/').pop()!;

    const savedToken = (tokenRepository.save as jest.Mock).mock.calls[0][0] as Token;
    expect(savedToken.tokenHash).not.toBe(rawToken);
    expect(savedToken.tokenHash).toHaveLength(64);
  });

  it('throws UserNotFoundError when user does not exist', async () => {
    const usecase = new GenerateAdminResetLink(buildMockUserRepository(null), buildMockTokenRepository());

    await expect(usecase.execute({ userId: 'unknown', clientUrl: 'https://app.com' }))
      .rejects.toThrow(UserNotFoundError);
  });

  it('throws UserNotFoundError when user is deleted', async () => {
    const deletedUser = { id: 'user-1', isDeleted: true } as User;
    const usecase = new GenerateAdminResetLink(buildMockUserRepository(deletedUser), buildMockTokenRepository());

    await expect(usecase.execute({ userId: 'user-1', clientUrl: 'https://app.com' }))
      .rejects.toThrow(UserNotFoundError);
  });
});
