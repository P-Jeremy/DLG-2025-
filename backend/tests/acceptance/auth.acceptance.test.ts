import request from 'supertest';
import app from '../../src/index';
import { UserModel } from '../../src/infrastructure/models/userModel';

function getTypedApp(): import('express').Application {
  return app as import('express').Application;
}

const USER_API_KEY = process.env.USER_API_KEY!;

function registerPayload(email: string, pseudo: string, password: string): Record<string, string> {
  return { email, pseudo, password, apiKey: USER_API_KEY };
}

describe('Auth endpoints (acceptance)', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201 with userId', async () => {
      const { status, body } = await request(getTypedApp())
        .post('/api/auth/register')
        .send(registerPayload('newuser@example.com', 'newuser', 'password123'));

      expect(status).toBe(201);
      expect(body).toHaveProperty('userId');
    });

    it('should return 409 when email is already taken', async () => {
      await request(getTypedApp())
        .post('/api/auth/register')
        .send(registerPayload('taken@example.com', 'user1', 'pass'));

      const { status, body } = await request(getTypedApp())
        .post('/api/auth/register')
        .send(registerPayload('taken@example.com', 'user2', 'pass'));

      expect(status).toBe(409);
      expect(body.message).toBe('Email already taken');
    });

    it('should return 409 when pseudo is already taken', async () => {
      await request(getTypedApp())
        .post('/api/auth/register')
        .send(registerPayload('user3@example.com', 'dupseudo', 'pass'));

      const { status, body } = await request(getTypedApp())
        .post('/api/auth/register')
        .send(registerPayload('user4@example.com', 'dupseudo', 'pass'));

      expect(status).toBe(409);
      expect(body.message).toBe('Pseudo already taken');
    });

    it('should return 400 when email format is invalid', async () => {
      const { status } = await request(getTypedApp())
        .post('/api/auth/register')
        .send(registerPayload('not-an-email', 'user', 'pass'));

      expect(status).toBe(400);
    });

    it('should return 403 when apiKey is missing', async () => {
      const { status } = await request(getTypedApp())
        .post('/api/auth/register')
        .send({ email: 'nokey@example.com', pseudo: 'nokey', password: 'pass' });

      expect(status).toBe(403);
    });
  });

  describe('GET /api/auth/activate/:token', () => {
    it('should activate account when token is valid', async () => {
      await request(getTypedApp())
        .post('/api/auth/register')
        .send(registerPayload('activate@example.com', 'activateuser', 'pass'));

      const user = await UserModel.findOne({ email: 'activate@example.com' });
      const token = user!.tokens[0].used_token;

      const { status, body } = await request(getTypedApp())
        .get(`/api/auth/activate/${token}`);

      expect(status).toBe(200);
      expect(body.success).toBe(true);

      const activated = await UserModel.findOne({ email: 'activate@example.com' });
      expect(activated!.isActive).toBe(true);
      expect(activated!.tokens).toHaveLength(0);
    });

    it('should return 400 for invalid activation token', async () => {
      const { status } = await request(getTypedApp())
        .get('/api/auth/activate/invalid-token-xyz');

      expect(status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return token and user info on successful login', async () => {
      await request(getTypedApp())
        .post('/api/auth/register')
        .send(registerPayload('login@example.com', 'loginuser', 'mypassword'));

      const user = await UserModel.findOne({ email: 'login@example.com' });
      const token = user!.tokens[0].used_token;
      await request(getTypedApp()).get(`/api/auth/activate/${token}`);

      const { status, body } = await request(getTypedApp())
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'mypassword' });

      expect(status).toBe(200);
      expect(body).toHaveProperty('token');
      expect(body.pseudo).toBe('loginuser');
      expect(body.isAdmin).toBe(false);
    });

    it('should return 401 for non-existent user', async () => {
      const { status } = await request(getTypedApp())
        .post('/api/auth/login')
        .send({ email: 'ghost@example.com', password: 'pass' });

      expect(status).toBe(401);
    });

    it('should return 401 for wrong password', async () => {
      await request(getTypedApp())
        .post('/api/auth/register')
        .send(registerPayload('wrongpass@example.com', 'wrongpassuser', 'correct'));

      const user = await UserModel.findOne({ email: 'wrongpass@example.com' });
      await request(getTypedApp()).get(`/api/auth/activate/${user!.tokens[0].used_token}`);

      const { status } = await request(getTypedApp())
        .post('/api/auth/login')
        .send({ email: 'wrongpass@example.com', password: 'wrong' });

      expect(status).toBe(401);
    });

    it('should return 403 for non-activated account', async () => {
      await request(getTypedApp())
        .post('/api/auth/register')
        .send(registerPayload('inactive@example.com', 'inactiveuser', 'pass'));

      const { status } = await request(getTypedApp())
        .post('/api/auth/login')
        .send({ email: 'inactive@example.com', password: 'pass' });

      expect(status).toBe(403);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return success true for existing user', async () => {
      await request(getTypedApp())
        .post('/api/auth/register')
        .send(registerPayload('forgot@example.com', 'forgotuser', 'pass'));

      const user = await UserModel.findOne({ email: 'forgot@example.com' });
      await request(getTypedApp()).get(`/api/auth/activate/${user!.tokens[0].used_token}`);

      const { status, body } = await request(getTypedApp())
        .post('/api/auth/forgot-password')
        .send({ email: 'forgot@example.com' });

      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });

    it('should return success true even for non-existent email', async () => {
      const { status, body } = await request(getTypedApp())
        .post('/api/auth/forgot-password')
        .send({ email: 'nobody@example.com' });

      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password when token is valid', async () => {
      await request(getTypedApp())
        .post('/api/auth/register')
        .send(registerPayload('resetpass@example.com', 'resetpassuser', 'oldpass'));

      const user = await UserModel.findOne({ email: 'resetpass@example.com' });
      const activationToken = user!.tokens[0].used_token;
      await request(getTypedApp()).get(`/api/auth/activate/${activationToken}`);

      await request(getTypedApp())
        .post('/api/auth/forgot-password')
        .send({ email: 'resetpass@example.com' });

      const updated = await UserModel.findOne({ email: 'resetpass@example.com' });
      const resetToken = updated!.tokens[0].used_token;

      const { status, body } = await request(getTypedApp())
        .post('/api/auth/reset-password')
        .send({ token: resetToken, newPassword: 'newpass123' });

      expect(status).toBe(200);
      expect(body.success).toBe(true);

      const loginResult = await request(getTypedApp())
        .post('/api/auth/login')
        .send({ email: 'resetpass@example.com', password: 'newpass123' });
      expect(loginResult.status).toBe(200);
    });

    it('should return 400 for invalid reset token', async () => {
      const { status } = await request(getTypedApp())
        .post('/api/auth/reset-password')
        .send({ token: 'bad-token', newPassword: 'newpass' });

      expect(status).toBe(400);
    });
  });

  describe('PATCH /api/users/me/notifications', () => {
    it('should update notification preferences when authenticated', async () => {
      await request(getTypedApp())
        .post('/api/auth/register')
        .send(registerPayload('notif@example.com', 'notifuser', 'pass'));

      const user = await UserModel.findOne({ email: 'notif@example.com' });
      await request(getTypedApp()).get(`/api/auth/activate/${user!.tokens[0].used_token}`);

      const loginResult = await request(getTypedApp())
        .post('/api/auth/login')
        .send({ email: 'notif@example.com', password: 'pass' });

      const { token } = loginResult.body;

      const { status, body } = await request(getTypedApp())
        .patch('/api/users/me/notifications')
        .set('Authorization', `Bearer ${token}`)
        .send({ titleNotif: false });

      expect(status).toBe(200);
      expect(body.titleNotif).toBe(false);
    });

    it('should return 401 when no authorization header is provided', async () => {
      const { status } = await request(getTypedApp())
        .patch('/api/users/me/notifications')
        .send({ titleNotif: false });

      expect(status).toBe(401);
    });
  });
});
