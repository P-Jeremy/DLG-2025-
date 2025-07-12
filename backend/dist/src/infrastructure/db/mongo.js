"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
/* eslint-disable no-undef */
const mongoose_1 = __importDefault(require("mongoose"));
async function connectMongo(uri) {
    try {
        await mongoose_1.default.connect(uri);
        console.log('Connected to MongoDB');
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('MongoDB connection error:', error.message);
        }
        else {
            console.error('MongoDB connection error:', error);
        }
        process.exit(1);
    }
}
