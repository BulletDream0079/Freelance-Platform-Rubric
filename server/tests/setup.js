const mongoose = require("mongoose");
let mem = null;

async function connect() {
  if (process.env.MONGO_TEST_URI) {
    await mongoose.connect(process.env.MONGO_TEST_URI);
    return;
  }
  const { MongoMemoryServer } = require("mongodb-memory-server");
  mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri());
}

async function clear() {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

async function close() {
  await mongoose.connection.dropDatabase().catch(() => {});
  await mongoose.disconnect();
  if (mem) await mem.stop();
}

module.exports = { connect, clear, close };
