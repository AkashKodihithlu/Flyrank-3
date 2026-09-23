const path = require('path');
const Database = require('better-sqlite3');

// Connect to SQLite database (creates tasks.db if it does not exist)
const dbPath = path.join(__dirname, 'tasks.db');
const db = new Database(dbPath);

// Enable foreign keys and recommended settings
db.pragma('journal_mode = WAL');

// Create tasks table if it does not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  );
`);

// Seed three example tasks only if the table is empty
const rowCount = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count;

if (rowCount === 0) {
  const insertTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const seedTransaction = db.transaction((tasksToSeed) => {
    for (const task of tasksToSeed) {
      insertTask.run(task.title, task.done);
    }
  });

  seedTransaction([
    { title: 'Learn Express basics', done: 1 },
    { title: 'Build a CRUD API', done: 1 },
    { title: 'Connect to SQLite database', done: 0 }
  ]);
  console.log('Database initialized and seeded with 3 example tasks.');
}

module.exports = db;
