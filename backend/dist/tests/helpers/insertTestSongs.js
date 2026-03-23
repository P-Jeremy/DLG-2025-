"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTestSongs = void 0;
require("../../src/infrastructure/models/tagModel");
const songModel_1 = require("../../src/infrastructure/models/songModel");
const insertTestSongs = async (songs) => {
    return songModel_1.SongModel.insertMany(songs);
};
exports.insertTestSongs = insertTestSongs;
