import request from 'supertest';
import app from '../../src/index';
import { insertTestAdmin } from '../helpers/insertTestAdmin';
import { insertTestUser } from '../helpers/insertTestUser';

function getTypedApp(): import('express').Application {
  return app as import('express').Application;
}

async function getAdminToken(): Promise<string> {
  const { email, password } = await insertTestAdmin();
  const res = await request(getTypedApp())
    .post('/api/auth/login')
    .send({ email, password });
  return (res.body as { token: string }).token;
}

async function getNonAdminToken(): Promise<string> {
  await insertTestUser({ email: 'regular@example.com', pseudo: 'regular', password: 'pass', isActive: true, isAdmin: false });
  const res = await request(getTypedApp())
    .post('/api/auth/login')
    .send({ email: 'regular@example.com', password: 'pass' });
  return (res.body as { token: string }).token;
}

describe('Users endpoints (acceptance)', () => {
  describe('GET /api/users', () => {
    it('returns 401 without token', async () => {
      const { status } = await request(getTypedApp()).get('/api/users');
      expect(status).toBe(401);
    });

    it('returns 403 for non-admin user', async () => {
      const token = await getNonAdminToken();
      const { status } = await request(getTypedApp())
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);
      expect(status).toBe(403);
    });

    it('returns 200 with user list for admin', async () => {
      const token = await getAdminToken();
      const { status, body } = await request(getTypedApp())
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      const users = body as { email: string; pseudo: string; isAdmin: boolean }[];
      expect(users.length).toBeGreaterThan(0);
      expect(users[0]).toHaveProperty('email');
      expect(users[0]).toHaveProperty('pseudo');
      expect(users[0]).toHaveProperty('isAdmin');
    });
  });

  describe('PATCH /api/users/:id/role', () => {
    it('returns 401 without token', async () => {
      const { status } = await request(getTypedApp())
        .patch('/api/users/some-id/role')
        .send({ isAdmin: true });
      expect(status).toBe(401);
    });

    it('returns 403 for non-admin user', async () => {
      const token = await getNonAdminToken();
      const { status } = await request(getTypedApp())
        .patch('/api/users/some-id/role')
        .set('Authorization', `Bearer ${token}`)
        .send({ isAdmin: true });
      expect(status).toBe(403);
    });

    it('returns 200 and updates isAdmin for target user', async () => {
      const token = await getAdminToken();
      const target = await insertTestUser({ email: 'target@example.com', pseudo: 'target', password: 'pass', isActive: true });

      const { status, body } = await request(getTypedApp())
        .patch(`/api/users/${target._id}/role`)
        .set('Authorization', `Bearer ${token}`)
        .send({ isAdmin: true });

      expect(status).toBe(200);
      expect((body as { isAdmin: boolean }).isAdmin).toBe(true);
    });

    it('returns 403 when admin targets themselves', async () => {
      const { email, password } = await insertTestAdmin({ email: 'self@dlg.com', pseudo: 'selfadmin' });
      const loginRes = await request(getTypedApp())
        .post('/api/auth/login')
        .send({ email, password });
      const adminToken = (loginRes.body as { token: string }).token;

      const usersRes = await request(getTypedApp())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      const users = usersRes.body as { id: string; email: string }[];
      const self = users.find((u) => u.email === 'self@dlg.com')!;

      const { status, body } = await request(getTypedApp())
        .patch(`/api/users/${self.id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isAdmin: false });

      expect(status).toBe(403);
      expect((body as { message: string }).message).toBe('Cannot modify your own role');
    });

    it('returns 404 for unknown user id', async () => {
      const token = await getAdminToken();

      const { status } = await request(getTypedApp())
        .patch('/api/users/000000000000000000000001/role')
        .set('Authorization', `Bearer ${token}`)
        .send({ isAdmin: true });

      expect(status).toBe(404);
    });

    it('returns 400 when isAdmin is not a boolean', async () => {
      const token = await getAdminToken();

      const { status } = await request(getTypedApp())
        .patch('/api/users/some-id/role')
        .set('Authorization', `Bearer ${token}`)
        .send({ isAdmin: 'true' });

      expect(status).toBe(400);
    });
  });
});
