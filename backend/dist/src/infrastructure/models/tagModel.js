"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagModel = void 0;
const mongoose_1 = require("mongoose");
const TagSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
});
exports.TagModel = (0, mongoose_1.model)('Tag', TagSchema);
