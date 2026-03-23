import { register, login, forgotPassword, resetPassword, activateAccount } from './auth';

type GlobalWithFetch = typeof globalThis & { fetch: jest.Mock };

const mockFetch = (ok: boolean, body: unknown) => {
  (globalThis as GlobalWithFetch).fetch = jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  } as Response);
};

const mockFetchRejected = (error: Error) => {
  (globalThis as GlobalWithFetch).fetch = jest.fn().mockRejectedValue(error);
};

describe('Unit | API | auth', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    it('sends a POST to /api/auth/register with correct payload', async () => {
      mockFetch(true, {});

      await register({ email: 'test@test.com', pseudo: 'test', password: 'secret', apiKey: 'test-key' });

      expect((globalThis as GlobalWithFetch).fetch).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@test.com', pseudo: 'test', password: 'secret', apiKey: 'test-key' }),
        })
      );
    });

    it('throws with message from API on error response', async () => {
      mockFetch(false, { message: 'Email already taken' });

      await expect(register({ email: 'a@b.com', pseudo: 'a', password: 'p', apiKey: 'test-key' }))
        .rejects.toThrow('Email already taken');
    });

    it('throws generic message when response body has no message field', async () => {
      mockFetch(false, {});

      await expect(register({ email: 'a@b.com', pseudo: 'a', password: 'p', apiKey: 'test-key' }))
        .rejects.toThrow('Une erreur est survenue');
    });
  });

  describe('login', () => {
    it('sends a POST to /api/auth/login and returns token data', async () => {
      const responseData = { token: 'jwt-token', isAdmin: false, pseudo: 'testuser' };
      mockFetch(true, responseData);

      const result = await login({ email: 'test@test.com', password: 'secret' });

      expect((globalThis as GlobalWithFetch).fetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({ method: 'POST' })
      );
      expect(result).toEqual(responseData);
    });

    it('throws with message from API on error response', async () => {
      mockFetch(false, { message: 'Invalid credentials' });

      await expect(login({ email: 'a@b.com', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('forgotPassword', () => {
    it('sends a POST to /api/auth/forgot-password', async () => {
      mockFetch(true, {});

      await forgotPassword({ email: 'test@test.com' });

      expect((globalThis as GlobalWithFetch).fetch).toHaveBeenCalledWith(
        '/api/auth/forgot-password',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws with message from API on error response', async () => {
      mockFetch(false, { message: 'Server error' });

      await expect(forgotPassword({ email: 'a@b.com' }))
        .rejects.toThrow('Server error');
    });
  });

  describe('resetPassword', () => {
    it('sends a POST to /api/auth/reset-password with token and newPassword', async () => {
      mockFetch(true, {});

      await resetPassword({ token: 'reset-token', newPassword: 'newpass' });

      expect((globalThis as GlobalWithFetch).fetch).toHaveBeenCalledWith(
        '/api/auth/reset-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: 'reset-token', newPassword: 'newpass' }),
        })
      );
    });

    it('throws with message from API on error response', async () => {
      mockFetch(false, { message: 'Invalid token' });

      await expect(resetPassword({ token: 'bad-token', newPassword: 'pass' }))
        .rejects.toThrow('Invalid token');
    });
  });

  describe('activateAccount', () => {
    it('sends a GET to /api/auth/activate/:token', async () => {
      mockFetch(true, {});

      await activateAccount('activation-token');

      expect((globalThis as GlobalWithFetch).fetch).toHaveBeenCalledWith(
        '/api/auth/activate/activation-token'
      );
    });

    it('throws with message from API on error response', async () => {
      mockFetch(false, { message: 'Token expired' });

      await expect(activateAccount('bad-token'))
        .rejects.toThrow('Token expired');
    });

    it('throws when fetch rejects', async () => {
      mockFetchRejected(new Error('Network error'));

      await expect(activateAccount('token'))
        .rejects.toThrow('Network error');
    });
  });
});
