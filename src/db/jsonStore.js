const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "..", "data");
const databasePath = path.join(dataDir, "database.json");

const emptyDatabase = {
  categories: [
    {
      id: 1,
      name: "급식",
      sort_order: 1,
      created_at: "2026-06-16 10:00:00"
    },
    {
      id: 2,
      name: "시설",
      sort_order: 2,
      created_at: "2026-06-16 10:00:00"
    },
    {
      id: 3,
      name: "수업",
      sort_order: 3,
      created_at: "2026-06-16 10:00:00"
    },
    {
      id: 4,
      name: "생활",
      sort_order: 4,
      created_at: "2026-06-16 10:00:00"
    }
  ],
  suggestions: [],
  likes: []
};

function ensureDatabase() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(databasePath)) {
    fs.writeFileSync(databasePath, `${JSON.stringify(emptyDatabase, null, 2)}\n`);
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
