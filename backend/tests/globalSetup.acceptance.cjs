/* eslint-disable */
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

module.exports = async function globalSetup() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  global.__MONGO_URI__ = uri;
  global.__MONGO_SERVER__ = mongoServer;
  process.env.MONGO_URI = uri;
  process.env.PORT = '3000';
  process.env.JWT_SECRET = 'test-jwt-secret-acceptance';
  process.env.NODE_ENV = 'test';
  process.env.USER_API_KEY = process.env.USER_API_KEY ?? 'test-user-key';
  process.env.ADMIN_API_KEY = process.env.ADMIN_API_KEY ?? 'test-admin-key';
  process.env.CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';
};
