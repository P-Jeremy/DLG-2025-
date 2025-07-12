"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Song_1 = require("../../src/domain/models/Song");
const songRepository_1 = require("../../src/infrastructure/repositories/songRepository");
const insertTestSongs_1 = require("../helpers/insertTestSongs");
const insertTestTags_1 = require("../helpers/insertTestTags");
describe('SongRepository integration test', () => {
    let songRepository;
    beforeAll(() => {
        songRepository = new songRepository_1.SongRepository();
    });
    it('should save and retrieve songs correctly', async () => {
        // given
        const tags = [{ name: 'toto' }];
        const insertedTags = await (0, insertTestTags_1.insertTestTags)(tags);
        const typedTags = insertedTags;
        const songsData = [
            {
                title: 'Repo Song',
                author: 'Repo Artist',
                tab: 'tabs',
                lyrics: 'lyrics',
                tags: typedTags.map((tag) => tag._id),
            },
        ];
        await (0, insertTestSongs_1.insertTestSongs)(songsData);
        const expectedTags = typedTags.map((tag) => ({
            id: tag._id.toString(),
            name: tag.name,
        }));
        const expectedSongs = [
            {
                title: songsData[0].title,
                author: songsData[0].author,
                lyrics: songsData[0].lyrics,
                tab: songsData[0].tab,
                tags: expectedTags,
            },
        ];
        // when
        const songs = await songRepository.getAll();
        // then
        expect(songs).toHaveLength(1);
        expect(songs).toMatchObject(expectedSongs);
        expect(songs[0] instanceof Song_1.Song).toBe(true);
    });
});
