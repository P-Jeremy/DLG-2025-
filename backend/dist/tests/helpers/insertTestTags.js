"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTestTags = void 0;
const tagModel_1 = require("../../src/infrastructure/models/tagModel");
const insertTestTags = async (tags) => {
    return tagModel_1.TagModel.insertMany(tags);
};
exports.insertTestTags = insertTestTags;
