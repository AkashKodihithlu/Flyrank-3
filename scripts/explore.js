/**
 * Script to execute manual SQL queries on tasks.db directly,
 * demonstrating how the database can be inspected and manipulated
 * independent of the API server.
 */
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'tasks.db'));

console.log('=== Stage 4: SQLite Direct Query Exploration ===\n');

// 1. List every task
console.log('1. SELECT * FROM tasks;');
const allTasks = db.prepare('SELECT * FROM tasks').all();
console.table(allTasks);

// 2. Only completed tasks
console.log('\n2. SELECT * FROM tasks WHERE done = 1;');
const completedTasks = db.prepare('SELECT * FROM tasks WHERE done = 1').all();
console.table(completedTasks);

// 3. Count total tasks
console.log('\n3. SELECT COUNT(*) AS total_count FROM tasks;');
const countResult = db.prepare('SELECT COUNT(*) AS total_count FROM tasks').get();
console.log(`Total tasks count: ${countResult.total_count}\n`);

// 4. Update task example
console.log('4. UPDATE tasks SET done = 1 WHERE id = 3;');
const updateResult = db.prepare('UPDATE tasks SET done = 1 WHERE id = 3').run();
console.log(`Rows updated: ${updateResult.changes}\n`);

// 5. Query after update
console.log('5. SELECT * FROM tasks WHERE id = 3;');
console.log(db.prepare('SELECT * FROM tasks WHERE id = 3').get());

console.log('\n=== Exploration Complete ===');
