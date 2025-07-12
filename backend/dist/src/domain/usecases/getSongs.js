"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSongsUsecase = void 0;
class GetSongsUsecase {
    constructor(songRepo) {
        this.songRepo = songRepo;
    }
    async execute() {
        return this.songRepo.getAll();
    }
}
exports.GetSongsUsecase = GetSongsUsecase;
