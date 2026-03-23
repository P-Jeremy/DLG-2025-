"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const songModel_1 = require("../infrastructure/models/songModel");
const router = (0, express_1.Router)();
router.get('/songs', async (req, res) => {
    try {
        const songs = await songModel_1.SongModel.find().exec();
        res.json(songs);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch songs' });
    }
});
exports.default = router;
