import { ResendEmailService } from '../../src/infrastructure/services/ResendEmailService';

const mockSend = jest.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null });

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

describe('ResendEmailService', () => {
  const originalEnv = process.env;
  let service: ResendEmailService;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CLIENT_URL: 'https://example.com',
      RESEND_API_KEY: 're_test_key',
      RESEND_FROM_EMAIL: 'noreply@example.com',
    };
    mockSend.mockClear();
    service = new ResendEmailService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('sendActivationEmail', () => {
    it('should send an email containing the activation link', async () => {
      await service.sendActivationEmail('user@test.com', 'abc123');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0];
      expect(call.to).toBe('user@test.com');
      expect(call.html).toContain('https://example.com/activate/abc123');
    });

    it('should use RESEND_FROM_EMAIL as sender', async () => {
      await service.sendActivationEmail('user@test.com', 'abc123');

      const call = mockSend.mock.calls[0][0];
      expect(call.from).toBe('noreply@example.com');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send an email containing the reset link', async () => {
      await service.sendPasswordResetEmail('user@test.com', 'tok456');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0];
      expect(call.to).toBe('user@test.com');
      expect(call.html).toContain('https://example.com/reset-password/tok456');
    });
  });

  describe('sendNewSongNotification', () => {
    it('should send an email with the song title', async () => {
      await service.sendNewSongNotification('user@test.com', 'Ma chanson');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0];
      expect(call.html).toContain('Ma chanson');
    });

    it('should escape HTML characters in the song title', async () => {
      await service.sendNewSongNotification('user@test.com', '<script>alert(1)</script>');

      const call = mockSend.mock.calls[0][0];
      expect(call.html).not.toContain('<script>');
      expect(call.html).toContain('&lt;script&gt;');
    });
  });

  describe('missing environment variables', () => {
    it('should throw when RESEND_API_KEY is not set', async () => {
      process.env.RESEND_API_KEY = undefined;
      service = new ResendEmailService();

      await expect(service.sendActivationEmail('user@test.com', 'token')).rejects.toThrow(
        'RESEND_API_KEY environment variable is not set',
      );
    });

    it('should throw when CLIENT_URL is not set', async () => {
      process.env.CLIENT_URL = undefined;
      service = new ResendEmailService();

      await expect(service.sendActivationEmail('user@test.com', 'token')).rejects.toThrow(
        'CLIENT_URL environment variable is not set',
      );
    });
  });
});
