const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Interactive API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// In-memory data store for Assignment 1
let tasks = [
  { id: 1, title: 'Learn Express basics', done: true },
  { id: 2, title: 'Build a CRUD API', done: true },
  { id: 3, title: 'Connect to SQLite database', done: false }
];
let nextId = 4;

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

// GET /tasks - List all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id - Get a single task by id
app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must not be empty' });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    done: false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id - Update task title and/or done
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, done } = req.body;

  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: 'At least one field (title or done) must be provided' });
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }
    task.title = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({ error: 'Done must be a boolean' });
    }
    task.done = done;
  }

  res.json(task);
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/docs`);
  });
}

module.exports = app;
