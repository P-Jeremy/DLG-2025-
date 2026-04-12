import request, { Response } from 'supertest';
import app from '../../src/index';
import { insertTestSongs } from '../helpers/insertTestSongs';
import { insertTestAdmin } from '../helpers/insertTestAdmin';
import { MetaModel } from '../../src/infrastructure/models/metaModel';

jest.mock('../../src/infrastructure/services/S3FileUploadService', () => ({
  S3FileUploadService: jest.fn().mockImplementation(() => ({
    upload: jest.fn().mockResolvedValue('https://bucket.s3.amazonaws.com/mocked-new-tab.png'),
    delete: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('GET /api/songs (acceptance)', () => {
  it('should return a list of songs', async () => {
    const songsData = [
      {
        title: 'Song One',
        author: 'Artist 1',
        tab: 'tab1',
        lyrics: 'lyrics1',
      },
      {
        title: 'Song Two',
        author: 'Artist 2',
        tab: 'tab2',
        lyrics: 'lyrics2',
      },
    ];
    await insertTestSongs(songsData);

    function getTypedApp(): import('express').Application {
      return app as import('express').Application;
    }
    const res: Response = await request(getTypedApp()).get('/api/songs');
    interface SongResponse {
      id?: string;
      title: string;
      author: string;
      lyrics: string;
      tab: string;
    }
    const { status, body } = res as { status: number; body: SongResponse[] };
    const songs: SongResponse[] = Array.isArray(body) ? body : [];

    expect(status).toBe(200);
    expect(songs.length).toBeGreaterThanOrEqual(2);
    expect(songs.some((s) => s.title === 'Song One')).toBe(true);
    expect(songs.some((s) => s.title === 'Song Two')).toBe(true);
  });
});

describe('POST /api/songs (acceptance)', () => {
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

  it('should update meta.updatedAt after creating a song', async () => {
    const adminToken = await getAdminToken();
    const before = new Date();

    await request(getTypedApp())
      .post('/api/songs')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'New Song')
      .field('author', 'Artist')
      .field('lyrics', '<p>lyrics</p>')
      .attach('tab', Buffer.from('fake-image-data'), { filename: 'tab.png', contentType: 'image/png' });

    const meta = await MetaModel.findOne({ singleton: 'global' });
    expect(meta).not.toBeNull();
    expect(meta!.updatedAt.getTime()).toBeGreaterThan(before.getTime());
  });
});

describe('DELETE /api/songs/:id (acceptance)', () => {
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

  it('should delete a song and return 204', async () => {
    const adminToken = await getAdminToken();
    const songs = await insertTestSongs([
      { title: 'To Delete', author: 'Artist', lyrics: 'l', tab: 't' },
    ]);
    const songId = (songs[0] as { _id: { toString(): string } })._id.toString();
    const before = new Date();

    const { status } = await request(getTypedApp())
      .delete(`/api/songs/${songId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(status).toBe(204);
    const meta = await MetaModel.findOne({ singleton: 'global' });
    expect(meta).not.toBeNull();
    expect(meta!.updatedAt.getTime()).toBeGreaterThan(before.getTime());
  });

  it('should return 404 when song does not exist', async () => {
    const adminToken = await getAdminToken();

    const { status } = await request(getTypedApp())
      .delete('/api/songs/000000000000000000000001')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(status).toBe(404);
  });

  it('should return 401 for unauthenticated requests', async () => {
    const { status } = await request(getTypedApp())
      .delete('/api/songs/000000000000000000000001');

    expect(status).toBe(401);
  });

  it('should remove the song from all playlists on delete', async () => {
    const adminToken = await getAdminToken();

    const songs = await insertTestSongs([
      { title: 'In Playlist', author: 'Artist', lyrics: 'l', tab: 't' },
    ]);
    const songId = (songs[0] as { _id: { toString(): string } })._id.toString();

    await request(getTypedApp())
      .post('/api/playlists/delete-song-playlist/songs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ songId });

    await request(getTypedApp())
      .delete(`/api/songs/${songId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const { body } = await request(getTypedApp())
      .get('/api/playlists/delete-song-playlist')
      .set('Authorization', `Bearer ${adminToken}`);

    const playlistSongIds = (body as { playlist: { songIds: string[] } | null }).playlist?.songIds ?? [];
    expect(playlistSongIds).not.toContain(songId);
  });
});

describe('PUT /api/songs/:id (acceptance)', () => {
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

  it('should return 401 when not authenticated', async () => {
    const { status } = await request(getTypedApp())
      .put('/api/songs/000000000000000000000001')
      .field('title', 'T')
      .field('author', 'A')
      .field('lyrics', '<p>L</p>');

    expect(status).toBe(401);
  });

  it('should return 404 when song does not exist', async () => {
    const adminToken = await getAdminToken();

    const { status } = await request(getTypedApp())
      .put('/api/songs/000000000000000000000099')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'T')
      .field('author', 'A')
      .field('lyrics', '<p>L</p>');

    expect(status).toBe(404);
  });

  it('should return 400 when required fields are missing', async () => {
    const adminToken = await getAdminToken();
    const songs = await insertTestSongs([
      { title: 'Song To Edit', author: 'Artist', lyrics: '<p>lyrics</p>', tab: 'https://s3/tab.png' },
    ]);
    const songId = (songs[0] as { _id: { toString(): string } })._id.toString();

    const { status } = await request(getTypedApp())
      .put(`/api/songs/${songId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('author', 'A')
      .field('lyrics', '<p>L</p>');

    expect(status).toBe(400);
  });

  it('should return 200 with updated song when valid input without new tab file', async () => {
    const adminToken = await getAdminToken();
    const songs = await insertTestSongs([
      { title: 'Original Title', author: 'Original Artist', lyrics: '<p>original</p>', tab: 'https://s3/tab.png' },
    ]);
    const songId = (songs[0] as { _id: { toString(): string } })._id.toString();
    const before = new Date();

    const { status, body } = await request(getTypedApp())
      .put(`/api/songs/${songId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Updated Title')
      .field('author', 'Updated Artist')
      .field('lyrics', '<p>updated lyrics</p>');

    expect(status).toBe(200);
    expect((body as { title: string; author: string }).title).toBe('Updated Title');
    expect((body as { title: string; author: string }).author).toBe('Updated Artist');
    const meta = await MetaModel.findOne({ singleton: 'global' });
    expect(meta).not.toBeNull();
    expect(meta!.updatedAt.getTime()).toBeGreaterThan(before.getTime());
  });

  it('should return 200 with updated song and new tab URL when valid input with new tab file', async () => {
    const adminToken = await getAdminToken();
    const songs = await insertTestSongs([
      { title: 'Song With Tab', author: 'Artist', lyrics: '<p>lyrics</p>', tab: 'https://s3/old-tab.png' },
    ]);
    const songId = (songs[0] as { _id: { toString(): string } })._id.toString();

    const { status, body } = await request(getTypedApp())
      .put(`/api/songs/${songId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Song With New Tab')
      .field('author', 'Artist')
      .field('lyrics', '<p>lyrics</p>')
      .attach('tab', Buffer.from('fake-image-data'), { filename: 'tab.png', contentType: 'image/png' });

    expect(status).toBe(200);
    expect((body as { tab: string }).tab).toBe('https://bucket.s3.amazonaws.com/mocked-new-tab.png');
  });
});
