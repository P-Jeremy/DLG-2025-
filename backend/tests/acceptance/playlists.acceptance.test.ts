import request from 'supertest';
import app from '../../src/index';
import { insertTestAdmin } from '../helpers/insertTestAdmin';
import { insertTestSongs } from '../helpers/insertTestSongs';
import { MetaModel } from '../../src/infrastructure/models/metaModel';

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
  describe('GET /api/playlists/:playlistName', () => {
    it('should return playlist for admin', async () => {
      const adminToken = await getAdminToken();

      await request(getTypedApp())
        .post('/api/playlists')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'rock' });

      const { status, body } = await request(getTypedApp())
        .get('/api/playlists/rock')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toBe(200);
      expect(body).toHaveProperty('playlist');
      expect(body).toHaveProperty('songs');
    });

    it('should return 404 for a playlist that does not exist', async () => {
      const { status } = await request(getTypedApp())
        .get('/api/playlists/nonexistent-playlist');

      expect(status).toBe(404);
    });
  });

  describe('POST /api/playlists', () => {
    it('should create a new playlist', async () => {
      const adminToken = await getAdminToken();
      const before = new Date();

      const { status, body } = await request(getTypedApp())
        .post('/api/playlists')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'jazz' });

      expect(status).toBe(201);
      expect((body as { name: string }).name).toBe('jazz');
      expect((body as { songIds: string[] }).songIds).toEqual([]);
      const meta = await MetaModel.findOne({ singleton: 'global' });
      expect(meta).not.toBeNull();
      expect(meta!.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });

    it('should return 409 when playlist already exists', async () => {
      const adminToken = await getAdminToken();

      await request(getTypedApp())
        .post('/api/playlists')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'duplicate-test' });

      const { status } = await request(getTypedApp())
        .post('/api/playlists')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'duplicate-test' });

      expect(status).toBe(409);
    });

    it('should return 400 when name is missing', async () => {
      const adminToken = await getAdminToken();

      const { status } = await request(getTypedApp())
        .post('/api/playlists')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(status).toBe(400);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const { status } = await request(getTypedApp())
        .post('/api/playlists')
        .send({ name: 'test' });

      expect(status).toBe(401);
    });
  });

  describe('PATCH /api/playlists/:playlistName', () => {
    it('should rename a playlist', async () => {
      const adminToken = await getAdminToken();

      await request(getTypedApp())
        .post('/api/playlists')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'old-name' });

      const before = new Date();

      const { status, body } = await request(getTypedApp())
        .patch('/api/playlists/old-name')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newName: 'new-name' });

      expect(status).toBe(200);
      expect((body as { name: string }).name).toBe('new-name');
      const meta = await MetaModel.findOne({ singleton: 'global' });
      expect(meta).not.toBeNull();
      expect(meta!.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });

    it('should return 404 when playlist does not exist', async () => {
      const adminToken = await getAdminToken();

      const { status } = await request(getTypedApp())
        .patch('/api/playlists/nonexistent-playlist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newName: 'new-name' });

      expect(status).toBe(404);
    });
  });

  describe('DELETE /api/playlists/:playlistName', () => {
    it('should delete a playlist', async () => {
      const adminToken = await getAdminToken();

      await request(getTypedApp())
        .post('/api/playlists')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'to-delete' });

      const before = new Date();

      const { status } = await request(getTypedApp())
        .delete('/api/playlists/to-delete')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toBe(204);
      const meta = await MetaModel.findOne({ singleton: 'global' });
      expect(meta).not.toBeNull();
      expect(meta!.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });

    it('should return 404 when playlist does not exist', async () => {
      const adminToken = await getAdminToken();

      const { status } = await request(getTypedApp())
        .delete('/api/playlists/nonexistent-playlist')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toBe(404);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const { status } = await request(getTypedApp())
        .delete('/api/playlists/some-playlist');

      expect(status).toBe(401);
    });
  });

  describe('POST /api/playlists/:playlistName/songs', () => {
    it('should add a song to a playlist and update meta.updatedAt', async () => {
      const adminToken = await getAdminToken();

      const songs = await insertTestSongs([
        { title: 'Song To Add', author: 'Artist', lyrics: 'l', tab: 't' },
      ]);
      const songId = (songs[0] as { _id: { toString(): string } })._id.toString();

      await request(getTypedApp())
        .post('/api/playlists')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'add-song-test' });

      const before = new Date();

      const { status, body } = await request(getTypedApp())
        .post('/api/playlists/add-song-test/songs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ songId });

      expect(status).toBe(200);
      expect((body as { songIds: string[] }).songIds).toContain(songId);
      const meta = await MetaModel.findOne({ singleton: 'global' });
      expect(meta).not.toBeNull();
      expect(meta!.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });
  });

  describe('DELETE /api/playlists/:playlistName/songs/:songId', () => {
    it('should remove a song from the playlist', async () => {
      const adminToken = await getAdminToken();

      const songs = await insertTestSongs([
        { title: 'Keep Me', author: 'Artist', lyrics: 'l', tab: 't' },
        { title: 'Remove Me', author: 'Artist', lyrics: 'l', tab: 't' },
      ]);

      const keepId = (songs[0] as { _id: { toString(): string } })._id.toString();
      const removeId = (songs[1] as { _id: { toString(): string } })._id.toString();

      await request(getTypedApp())
        .post('/api/playlists/remove-test/songs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ songId: keepId });

      await request(getTypedApp())
        .post('/api/playlists/remove-test/songs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ songId: removeId });

      const before = new Date();

      const { status, body } = await request(getTypedApp())
        .delete(`/api/playlists/remove-test/songs/${removeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toBe(200);
      expect((body as { songIds: string[] }).songIds).toEqual([keepId]);
      const meta = await MetaModel.findOne({ singleton: 'global' });
      expect(meta).not.toBeNull();
      expect(meta!.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });

    it('should return 404 when the playlist does not exist', async () => {
      const adminToken = await getAdminToken();

      const { status } = await request(getTypedApp())
        .delete('/api/playlists/nonexistent-playlist/songs/000000000000000000000002')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toBe(404);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const { status } = await request(getTypedApp())
        .delete('/api/playlists/some-playlist/songs/000000000000000000000002');

      expect(status).toBe(401);
    });
  });

  describe('PUT /api/playlists/:playlistName', () => {
    it('should reorder songs in playlist', async () => {
      const adminToken = await getAdminToken();

      const songs = await insertTestSongs([
        { title: 'Song A', author: 'Artist', lyrics: 'lyrics', tab: 'tab' },
        { title: 'Song B', author: 'Artist', lyrics: 'lyrics', tab: 'tab' },
      ]);

      const songAId = (songs[0] as { _id: { toString(): string } })._id.toString();
      const songBId = (songs[1] as { _id: { toString(): string } })._id.toString();

      await request(getTypedApp())
        .post('/api/playlists/pop/songs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ songId: songAId });

      await request(getTypedApp())
        .post('/api/playlists/pop/songs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ songId: songBId });

      const before = new Date();

      const { status, body } = await request(getTypedApp())
        .put('/api/playlists/pop')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ songIds: [songBId, songAId] });

      expect(status).toBe(200);
      expect((body as { songIds: string[] }).songIds).toEqual([songBId, songAId]);
      const meta = await MetaModel.findOne({ singleton: 'global' });
      expect(meta).not.toBeNull();
      expect(meta!.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });

    it('should return 400 for invalid songIds (not belonging to playlist)', async () => {
      const adminToken = await getAdminToken();

      await request(getTypedApp())
        .post('/api/playlists')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'jazz' });

      const { status } = await request(getTypedApp())
        .put('/api/playlists/jazz')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ songIds: ['000000000000000000000001'] });

      expect(status).toBe(400);
    });

    it('should return 400 when songIds is not an array', async () => {
      const adminToken = await getAdminToken();

      await request(getTypedApp())
        .post('/api/playlists')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'blues' });

      const { status } = await request(getTypedApp())
        .put('/api/playlists/blues')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ songIds: 'not-an-array' });

      expect(status).toBe(400);
    });
  });
});
