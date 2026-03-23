"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
beforeEach(async () => {
    if (mongoose_1.default.connection.db) {
        await mongoose_1.default.connection.db.dropDatabase();
    }
});
