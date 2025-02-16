require('dotenv').config();

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_DATABASE || "notes"
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
      console.error('Database connection failed:', err);
      return;
    }
    console.log('Connected to MySQL');
  
    // Table Name to Check
    const tableName = 'notes';
  
    // Query to Check if Table Exists
    const checkTableQuery = `SHOW TABLES LIKE '${tableName}'`;
  
    db.query(checkTableQuery, (err, results) => {
      if (err) {
        console.error('Error checking table:', err);
        return;
      }
  
      if (results.length > 0) {
        console.log(`Table '${tableName}' already exists.`);
        db.end(); // Close the connection
      } else {
        console.log(`Table '${tableName}' does not exist. Creating...`);
        createTable(tableName);
      }
    });
  });
  
  // Function to Create Table
  function createTable(tableName) {
    const createTableQuery = `
      CREATE TABLE ${tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL
      )
    `;
  
    db.query(createTableQuery, (err, result) => {
      if (err) {
        console.error('Error creating table:', err);
        return;
      }
      console.log('Table created successfully.');
      db.end(); // Close the connection
    });
  }