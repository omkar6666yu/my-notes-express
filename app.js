require('dotenv').config();
const express = require("express");
const nunjucks = require('nunjucks');
const app = express();
const mysql = require("mysql2");
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const port = process.env.APP_PORT || 3000;
// Configure Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app
  });
  
app.set('view engine', 'njk'); // Use .njk files

app.use(
    session({
        secret: process.env.KEY, 
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60000 } // Session expires in 1 minute
    })
);
  
app.use(flash());
app.use((req, res, next) => {
    res.locals.error = req.flash('error'); // Pass flash error messages to views
    res.locals.success = req.flash('success'); // Pass flash error messages to views
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

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
});

app.get("/", (req,res) => {
    const sql = 'SELECT * FROM notes ORDER BY id DESC';
    db.query(sql, (err, result) => {
        if (err) {
            req.flash('error', 'Error geting data.');
        }
        res.render('index', { notes: result });
    });
    
});

app.get("/new", (req,res) => {
    res.render('new');
});

app.post("/save", (req,res) => {
    let content = req.body.content;
    if(content == ""){
        req.flash('error', 'Content cannot be empty.');
        return res.redirect('/new');
    }
    const sql = 'INSERT INTO notes (content) VALUES (?)';
    db.query(sql, [content], (err, result) => {
        if (err) {
            req.flash('error', 'Error storing your note.');
            return res.redirect('/new');
        }
    });
    req.flash('success', 'Added successfully.');
    return res.redirect('/');
});

app.get('/delete/:id', (req,res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM notes WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            req.flash('error', 'Error deleting note.');
            return res.redirect('/');
        }
        if (result.affectedRows === 0) {
            req.flash('error', 'Note not found.');
            return res.redirect('/');
        }
        req.flash('success', 'Note deleted successfully.');
        return res.redirect('/');
    });
});


app.listen(port, (err) => {
    console.log("Server started on http://localhost:"+port);
})