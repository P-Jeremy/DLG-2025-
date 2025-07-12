"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const songsController_1 = require("../controllers/songsController");
const router = (0, express_1.Router)();
const controller = new songsController_1.SongsController();
router.get('/songs', async (req, res) => {
    console.log('[Route] GET /api/songs called');
    await controller.getSongs(req, res);
});
exports.default = router;
