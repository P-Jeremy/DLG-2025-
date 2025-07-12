"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SongRepository = void 0;
const songModel_1 = require("../models/songModel");
const Song_1 = require("../../domain/models/Song");
const Tag_1 = require("../../domain/models/Tag");
class SongRepository {
    async getAll() {
        try {
            const docs = await songModel_1.SongModel.find().populate('tags').exec();
            // console.log('[SongRepository] Fetched docs:', docs); // Suppression du log de debug
            return docs.map((doc) => this._toDomain(doc));
        }
        catch (err) {
            console.error('[SongRepository] Error in getAll:', err);
            throw err;
        }
    }
    _toDomain(doc) {
        return new Song_1.Song({
            id: doc._id.toString(),
            title: doc.title,
            author: doc.author,
            lyrics: doc.lyrics,
            tab: doc.tab,
            tags: Array.isArray(doc.tags)
                ? doc.tags.map((tag) => {
                    const { _id, name } = tag;
                    return new Tag_1.Tag({
                        id: _id.toString(),
                        name,
                    });
                })
                : [],
        });
    }
}
exports.SongRepository = SongRepository;
