"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getSongs_1 = require("../../src/domain/usecases/getSongs");
const songRepository_1 = require("../../src/infrastructure/repositories/songRepository");
const insertTestSongs_1 = require("../helpers/insertTestSongs");
const insertTestTags_1 = require("../helpers/insertTestTags");
const Song_1 = require("../../src/domain/models/Song");
const Tag_1 = require("../../src/domain/models/Tag");
describe('GetSongsUsecase integration test', () => {
    let usecase;
    beforeAll(() => {
        usecase = new getSongs_1.GetSongsUsecase(new songRepository_1.SongRepository());
    });
    it('should retrieve a list of songs', async () => {
        // given
        const tags = [
            { name: 'rock' },
            { name: 'pop' },
            { name: 'jazz' },
        ];
        const insertedTags = await (0, insertTestTags_1.insertTestTags)(tags);
        const typedTags = insertedTags;
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
        await (0, insertTestSongs_1.insertTestSongs)(songsData);
        // when
        const songs = await usecase.execute();
        // then
        const songWithoutTags = songs.find((s) => s.title === 'Song Without Tags');
        const songWithTags = songs.find((s) => s.title === 'Song With Tags');
        const expected = [
            new Song_1.Song({
                title: songWithoutTags.title,
                author: songWithoutTags.author,
                tab: songWithoutTags.tab,
                lyrics: songWithoutTags.lyrics,
                id: songWithoutTags.id,
                tags: [],
            }),
            new Song_1.Song({
                title: songWithTags.title,
                author: songWithTags.author,
                tab: songWithTags.tab,
                lyrics: songWithTags.lyrics,
                id: songWithTags.id,
                tags: insertedTags.map((tag) => new Tag_1.Tag({ id: String(tag._id), name: tag.name })),
            }),
        ];
        const sortByTitle = (a, b) => a.title.localeCompare(b.title);
        expect(songs.sort(sortByTitle)).toEqual(expected.sort(sortByTitle));
    });
});
