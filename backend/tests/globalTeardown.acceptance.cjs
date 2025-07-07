/* eslint-disable */
const mongoose = require('mongoose');

module.exports = async function globalTeardown() {
  await mongoose.disconnect();
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop();
  }
};
