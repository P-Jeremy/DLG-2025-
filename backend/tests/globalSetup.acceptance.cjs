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
};
