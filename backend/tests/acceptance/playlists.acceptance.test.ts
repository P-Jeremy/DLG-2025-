import request from 'supertest';
import app from '../../src/index';
import { insertTestAdmin } from '../helpers/insertTestAdmin';
import { insertTestTags } from '../helpers/insertTestTags';
import { insertTestSongs } from '../helpers/insertTestSongs';

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

describe('Playlists endpoints (acceptance)', () => {
  describe('GET /api/playlists/:tagId', () => {
    it('should return playlist for admin', async () => {
      const adminToken = await getAdminToken();
      const tags = await insertTestTags([{ name: 'rock' }]);
      const tagId = (tags[0] as { _id: { toString(): string } })._id.toString();

      const { status, body } = await request(getTypedApp())
        .get(`/api/playlists/${tagId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toBe(200);
      expect(body).toHaveProperty('playlist');
      expect(body).toHaveProperty('songs');
    });

    it('should return 403 for non-admin', async () => {
      const { status } = await request(getTypedApp())
        .get('/api/playlists/000000000000000000000001');

      expect(status).toBe(401);
    });
  });

  describe('PUT /api/playlists/:tagId', () => {
    it('should reorder songs in playlist', async () => {
      const adminToken = await getAdminToken();
      const tags = await insertTestTags([{ name: 'pop' }]);
      const tagId = (tags[0] as { _id: { toString(): string } })._id.toString();

      const songs = await insertTestSongs([
        { title: 'Song A', author: 'Artist', lyrics: 'lyrics', tab: 'tab', tags: [tagId] },
        { title: 'Song B', author: 'Artist', lyrics: 'lyrics', tab: 'tab', tags: [tagId] },
      ]);

      const songAId = (songs[0] as { _id: { toString(): string } })._id.toString();
      const songBId = (songs[1] as { _id: { toString(): string } })._id.toString();

      const { status, body } = await request(getTypedApp())
        .put(`/api/playlists/${tagId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ songIds: [songBId, songAId] });

      expect(status).toBe(200);
      expect((body as { songIds: string[] }).songIds).toEqual([songBId, songAId]);
    });

    it('should return 400 for invalid songIds (not belonging to tag)', async () => {
      const adminToken = await getAdminToken();
      const tags = await insertTestTags([{ name: 'jazz' }]);
      const tagId = (tags[0] as { _id: { toString(): string } })._id.toString();

      const { status } = await request(getTypedApp())
        .put(`/api/playlists/${tagId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ songIds: ['000000000000000000000001'] });

      expect(status).toBe(400);
    });

    it('should return 400 when songIds is not an array', async () => {
      const adminToken = await getAdminToken();
      const tags = await insertTestTags([{ name: 'blues' }]);
      const tagId = (tags[0] as { _id: { toString(): string } })._id.toString();

      const { status } = await request(getTypedApp())
        .put(`/api/playlists/${tagId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ songIds: 'not-an-array' });

      expect(status).toBe(400);
    });
  });
});
