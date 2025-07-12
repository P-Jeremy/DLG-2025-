"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SongModel = void 0;
require("../models/tagModel");
const mongoose_1 = require("mongoose");
const SongSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    lyrics: { type: String, required: true },
    tab: { type: String, required: true },
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Tag' }],
}, { timestamps: true });
exports.SongModel = (0, mongoose_1.model)('songs', SongSchema);
