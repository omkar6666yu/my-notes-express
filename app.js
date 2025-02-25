require('dotenv').config();
const express = require("express");
const nunjucks = require('nunjucks');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const { getNotes, saveNote, deleteNote } = require('./db');

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

app.get("/", async (req,res) => {
    let notes = await getNotes();
    res.render('index', { notes });
    
});

app.get("/new", (req,res) => {
    res.render('new');
});

app.post("/save", async (req,res) => {
    let content = req.body.content;
    if(content == ""){
        req.flash('error', 'Content cannot be empty.');
        return res.redirect('/new');
    }
    await saveNote(content);
    req.flash('success', 'Added successfully.');
    return res.redirect('/');
});

app.get('/delete/:id', async (req,res) => {
    const { id } = req.params;

    await deleteNote(id);
    req.flash('success', 'Note deleted successfully.');
    return res.redirect('/');
});


app.listen(port, (err) => {
    console.log("Server started on http://localhost:"+port);
})