const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// Connect to the SQLite database created by database/setup.js
const db = new sqlite3.Database(path.join(__dirname, 'database', 'university.db'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to university.db');
});

// Returns an error message if the body is missing/invalid, otherwise null
function validateCourse(body) {
  const { courseCode, title, credits, description, semester } = body || {};
  if (!courseCode || !title || !description || !semester || credits === undefined) {
    return 'courseCode, title, credits, description, and semester are required';
  }
  if (!Number.isInteger(credits)) {
    return 'credits must be an integer';
  }
  return null;
}

// GET /api/courses - all courses
app.get('/api/courses', (req, res) => {
  db.all('SELECT * FROM courses', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /api/courses/:id - one course
app.get('/api/courses/:id', (req, res) => {
  db.get('SELECT * FROM courses WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Course not found' });
    res.json(row);
  });
});

// POST /api/courses - add a course
app.post('/api/courses', (req, res) => {
  const problem = validateCourse(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const { courseCode, title, credits, description, semester } = req.body;
  const sql = `
    INSERT INTO courses (courseCode, title, credits, description, semester)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(sql, [courseCode, title, credits, description, semester], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, courseCode, title, credits, description, semester });
  });
});

// PUT /api/courses/:id - update a course
app.put('/api/courses/:id', (req, res) => {
  const problem = validateCourse(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const { courseCode, title, credits, description, semester } = req.body;
  const sql = `
    UPDATE courses
    SET courseCode = ?, title = ?, credits = ?, description = ?, semester = ?
    WHERE id = ?
  `;
  db.run(sql, [courseCode, title, credits, description, semester, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Course not found' });
    res.json({ id: Number(req.params.id), courseCode, title, credits, description, semester });
  });
});

// DELETE /api/courses/:id - remove a course
app.delete('/api/courses/:id', (req, res) => {
  db.run('DELETE FROM courses WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted', id: Number(req.params.id) });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Close the database connection on shutdown
process.on('SIGINT', () => {
  db.close(() => process.exit(0));
});
