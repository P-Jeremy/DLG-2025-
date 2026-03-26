import request from 'supertest';
import app from '../../src/index';
import { insertTestAdmin } from '../helpers/insertTestAdmin';
import { insertTestTags } from '../helpers/insertTestTags';

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

describe('Tags endpoints (acceptance)', () => {
  describe('GET /api/tags', () => {
    it('should return all tags', async () => {
      await insertTestTags([{ name: 'rock' }, { name: 'pop' }]);

      const { status, body } = await request(getTypedApp()).get('/api/tags');

      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      const names = (body as { name: string }[]).map((t) => t.name).sort();
      expect(names).toEqual(['pop', 'rock']);
    });
  });

  describe('POST /api/tags', () => {
    it('should create a tag when admin', async () => {
      const adminToken = await getAdminToken();

      const { status, body } = await request(getTypedApp())
        .post('/api/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'jazz' });

      expect(status).toBe(201);
      expect((body as { name: string }).name).toBe('jazz');
      expect((body as { id: string }).id).toBeDefined();
    });

    it('should return 409 when tag name already exists', async () => {
      const adminToken = await getAdminToken();
      await insertTestTags([{ name: 'blues' }]);

      const { status } = await request(getTypedApp())
        .post('/api/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'blues' });

      expect(status).toBe(409);
    });

    it('should return 403 for non-admin user', async () => {
      const { status } = await request(getTypedApp())
        .post('/api/tags')
        .send({ name: 'metal' });

      expect(status).toBe(401);
    });

    it('should return 400 when name is missing', async () => {
      const adminToken = await getAdminToken();

      const { status } = await request(getTypedApp())
        .post('/api/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '' });

      expect(status).toBe(400);
    });
  });

  describe('DELETE /api/tags/:id', () => {
    it('should delete a tag when admin', async () => {
      const adminToken = await getAdminToken();
      const tags = await insertTestTags([{ name: 'country' }]);
      const tagId = (tags[0] as { _id: { toString(): string } })._id.toString();

      const { status } = await request(getTypedApp())
        .delete(`/api/tags/${tagId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toBe(200);
    });

    it('should return 404 when tag not found', async () => {
      const adminToken = await getAdminToken();

      const { status } = await request(getTypedApp())
        .delete('/api/tags/000000000000000000000001')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const { status } = await request(getTypedApp())
        .delete('/api/tags/000000000000000000000001');

      expect(status).toBe(401);
    });
  });
});
