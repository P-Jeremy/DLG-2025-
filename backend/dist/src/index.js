"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('[DEBUG] src/index.ts loaded');
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const songs_1 = __importDefault(require("./application/routes/songs"));
const mongo_1 = require("./infrastructure/db/mongo");
const fs_1 = __importDefault(require("fs"));
if (fs_1.default.existsSync('.env')) {
    dotenv_1.default.config();
}
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGO_URI || '';
void (0, mongo_1.connectMongo)(mongoUri);
app.use(express_1.default.json());
app.use('/api', songs_1.default);
exports.default = app;
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
