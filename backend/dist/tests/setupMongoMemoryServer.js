"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTestDB = exports.disconnectTestDB = exports.connectTestDB = void 0;
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
let mongoServer = null;
const connectTestDB = async () => {
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    if (!mongoServer)
        throw new Error('MongoMemoryServer not initialized');
    const uri = mongoServer.getUri();
    await mongoose_1.default.connect(uri);
};
exports.connectTestDB = connectTestDB;
const disconnectTestDB = async () => {
    await mongoose_1.default.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
        mongoServer = null;
    }
};
exports.disconnectTestDB = disconnectTestDB;
const clearTestDB = async () => {
    const collections = mongoose_1.default.connection.collections;
    for (const key of Object.keys(collections)) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};
exports.clearTestDB = clearTestDB;
