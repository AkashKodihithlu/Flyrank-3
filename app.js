const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Interactive API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Helper function to format task output (ensures done is a boolean)
const formatTask = (task) => ({
  id: task.id,
  title: task.title,
  done: Boolean(task.done)
});

// GET / - API Info
app.get('/', (req, res) => {
  res.json({
    message: 'Task API is running',
    docs: '/docs'
  });
});

// GET /health - Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /stats - Real statistics using SQL aggregate functions (Optional Extra)
app.get('/stats', (req, res) => {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN done = 0 THEN 1 ELSE 0 END) AS pending
    FROM tasks
  `).get();

  res.json({
    total: stats.total || 0,
    completed: stats.completed || 0,
    pending: stats.pending || 0
  });
});

// GET /tasks - List tasks with optional search, filter, and sort (Extras)
app.get('/tasks', (req, res) => {
  const { search, done, sort } = req.query;

  let query = 'SELECT * FROM tasks';
  const conditions = [];
  const params = [];

  // Filter by search keyword (LIKE %...%)
  if (search && typeof search === 'string' && search.trim() !== '') {
    conditions.push('title LIKE ?');
    params.push(`%${search.trim()}%`);
  }

  // Filter by status (done=true or done=false)
  if (done !== undefined) {
    if (done === 'true' || done === '1') {
      conditions.push('done = 1');
    } else if (done === 'false' || done === '0') {
      conditions.push('done = 0');
    }
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  // Sort alphabetically or by id
  if (sort === 'title' || sort === 'asc') {
    query += ' ORDER BY title ASC';
  } else if (sort === 'desc') {
    query += ' ORDER BY title DESC';
  } else {
    query += ' ORDER BY id ASC';
  }

  const tasksFromDb = db.prepare(query).all(...params);
  res.json(tasksFromDb.map(formatTask));
});

// GET /tasks/:id - Get a single task by id (Stage 1: parameterized query)
app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(formatTask(task));
});

// POST /tasks - Create a new task (Stage 2: database insert)
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must not be empty' });
  }

  const cleanTitle = title.trim();
  const stmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const info = stmt.run(cleanTitle, 0);

  const newTask = {
    id: Number(info.lastInsertRowid),
    title: cleanTitle,
    done: false
  };

  res.status(201).json(newTask);
});

// PUT /tasks/:id - Update task title and/or done (Stage 3: update with SQL)
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, done } = req.body;
  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: 'At least one field (title or done) must be provided' });
  }

  let updatedTitle = existing.title;
  let updatedDone = existing.done;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }
    updatedTitle = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({ error: 'Done must be a boolean' });
    }
    updatedDone = done ? 1 : 0;
  }

  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(updatedTitle, updatedDone, id);

  res.json({
    id,
    title: updatedTitle,
    done: Boolean(updatedDone)
  });
});

// DELETE /tasks/:id - Delete a task (Stage 3: delete with SQL)
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(204).send();
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/docs`);
  });
}

module.exports = app;
