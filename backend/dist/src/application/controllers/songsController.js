"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SongsController = void 0;
const getSongs_1 = require("../../domain/usecases/getSongs");
const songRepository_1 = require("../../infrastructure/repositories/songRepository");
const songRepository = new songRepository_1.SongRepository();
const getSongsUsecase = new getSongs_1.GetSongsUsecase(songRepository);
class SongsController {
    async getSongs(req, res) {
        try {
            const songs = await getSongsUsecase.execute();
            res.json(songs);
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch songs' });
        }
    }
}
exports.SongsController = SongsController;
