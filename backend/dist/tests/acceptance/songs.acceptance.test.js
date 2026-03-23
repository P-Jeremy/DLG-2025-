"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../src/index"));
const insertTestSongs_1 = require("../helpers/insertTestSongs");
const insertTestTags_1 = require("../helpers/insertTestTags");
describe('GET /api/songs (acceptance)', () => {
    it('should return a list of songs with and without tags', async () => {
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
        function getTypedApp() {
            return index_1.default;
        }
        const res = await (0, supertest_1.default)(getTypedApp()).get('/api/songs');
        const { status, body } = res;
        const songs = Array.isArray(body) ? body : [];
        const songWithoutTags = songs.find((s) => s.title === 'Song Without Tags');
        const songWithTags = songs.find((s) => s.title === 'Song With Tags');
        if (!songWithoutTags || !songWithTags) {
            throw new Error('Expected songs not found in response');
        }
        const expected = [
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
                tags: insertedTags.
                    map((tag) => ({ id: String(tag._id), name: tag.name })),
            },
        ];
        const sortByTitle = (a, b) => a.title.localeCompare(b.title);
        expect({
            status,
            body: songs.sort(sortByTitle),
        }).toEqual({
            status: 200,
            body: expected.sort(sortByTitle),
        });
    });
});
