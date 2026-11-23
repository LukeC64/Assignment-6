// Import the sqlite3 package
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create (or open) the university.db database next to this file
const db = new sqlite3.Database(path.join(__dirname, 'university.db'), (err) => {
  if (err) {
    console.error('Error creating database:', err.message);
    process.exit(1);
  }
});

// SQL to create the courses table
const createCoursesTable = `
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courseCode TEXT,
    title TEXT,
    credits INTEGER,
    description TEXT,
    semester TEXT
  )
`;

db.serialize(() => {
  db.run(createCoursesTable, (err) => {
    if (err) {
      console.error('Error creating courses table:', err.message);
    } else {
      console.log('Database university.db and courses table created successfully.');
    }
  });
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  }
});
