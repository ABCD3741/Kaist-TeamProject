const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "..", "data");
const databasePath = path.join(dataDir, "database.json");
const seedPath = path.join(dataDir, "seed.json");

function ensureDatabase() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(databasePath)) {
    fs.copyFileSync(seedPath, databasePath);
  }
}

function readDatabase() {
  ensureDatabase();
  return JSON.parse(fs.readFileSync(databasePath, "utf8"));
}

function writeDatabase(database) {
  ensureDatabase();
  fs.writeFileSync(databasePath, `${JSON.stringify(database, null, 2)}\n`);
}

function nextId(items) {
  return items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
}

module.exports = {
  readDatabase,
  writeDatabase,
  nextId
};
