"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setupMongoMemoryServer_1 = require("./setupMongoMemoryServer");
beforeAll(async () => {
    await (0, setupMongoMemoryServer_1.connectTestDB)();
});
beforeEach(async () => {
    await (0, setupMongoMemoryServer_1.clearTestDB)();
});
afterAll(async () => {
    await (0, setupMongoMemoryServer_1.disconnectTestDB)();
});
