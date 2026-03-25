import request, { Response } from 'supertest';
import app from '../../src/index';
import { insertTestSongs } from '../helpers/insertTestSongs';
import { insertTestTags } from '../helpers/insertTestTags';
import { ITag } from '../../src/domain/interfaces/Tags';
import { PlaylistModel } from '../../src/infrastructure/models/playlistModel';

describe('GET /api/songs (acceptance)', () => {
  it('should return a list of songs with and without tags', async () => {
    const tags = [
      { name: 'rock' },
      { name: 'pop' },
      { name: 'jazz' },
    ];
    const insertedTags = await insertTestTags(tags);
    const typedTags = insertedTags as Array<ITag & { _id: string }>;
    const songsData = [
      {
        title: 'Song Without Tags',
        author: 'Artist 1',
        tab: 'tab1',
        lyrics: 'lyrics1',
        tags: [],
      },
      {
        title: 'Song With Tags',
        author: 'Artist 2',
        tab: 'tab2',
        lyrics: 'lyrics2',
        tags: typedTags.map((tag) => tag._id),
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
      tags: { id?: string; name: string }[];
    }
    const { status, body } = res as { status: number; body: SongResponse[] };
    const songs: SongResponse[] = Array.isArray(body) ? body : [];
    const songWithoutTags = songs.find((s) => s.title === 'Song Without Tags');
    const songWithTags = songs.find((s) => s.title === 'Song With Tags');
    if (!songWithoutTags || !songWithTags) {
      throw new Error('Expected songs not found in response');
    }
    const expected: SongResponse[] = [
      {
        title: songWithoutTags.title,
        author: songWithoutTags.author,
        tab: songWithoutTags.tab,
        lyrics: songWithoutTags.lyrics,
        id: songWithoutTags.id,
        tags: [],
      },
      {
        title: songWithTags.title,
        author: songWithTags.author,
        tab: songWithTags.tab,
        lyrics: songWithTags.lyrics,
        id: songWithTags.id,
        tags: (insertedTags as Array<ITag & { _id: string }>).
          map((tag) => ({ id: String(tag._id), name: tag.name })),
      },
    ];
    const sortByTitle = (a: SongResponse, b: SongResponse) => a.title.localeCompare(b.title);
    expect({
      status,
      body: songs.sort(sortByTitle),
    }).toEqual({
      status: 200,
      body: expected.sort(sortByTitle),
    });
  });
});

describe('GET /api/songs?tagId=xxx (acceptance)', () => {
  it('should return songs ordered by playlist when tagId is provided', async () => {
    const insertedTags = await insertTestTags([{ name: 'playlist-tag' }]);
    const tagId = (insertedTags[0] as { _id: { toString(): string } })._id.toString();

    const insertedSongs = await insertTestSongs([
      { title: 'Song Alpha', author: 'Artist', lyrics: 'l', tab: 't', tags: [tagId] },
      { title: 'Song Beta', author: 'Artist', lyrics: 'l', tab: 't', tags: [tagId] },
      { title: 'Song Gamma', author: 'Artist', lyrics: 'l', tab: 't', tags: [tagId] },
    ]);

    const songAlphaId = (insertedSongs[0] as { _id: { toString(): string } })._id.toString();
    const songBetaId = (insertedSongs[1] as { _id: { toString(): string } })._id.toString();
    const songGammaId = (insertedSongs[2] as { _id: { toString(): string } })._id.toString();

    await PlaylistModel.create({ tagId, songIds: [songGammaId, songAlphaId, songBetaId] });

    function getTypedApp(): import('express').Application {
      return app as import('express').Application;
    }

    const res = await request(getTypedApp()).get(`/api/songs?tagId=${tagId}`);
    const { status, body } = res as { status: number; body: { id: string; title: string }[] };

    expect(status).toBe(200);
    expect(body.map((s) => s.title)).toEqual(['Song Gamma', 'Song Alpha', 'Song Beta']);
  });
});
