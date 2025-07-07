import { connectTestDB, disconnectTestDB, clearTestDB } from './setupMongoMemoryServer';

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});
