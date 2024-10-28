const express = require('express');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();
const port = 8080;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Set the view engine (e.g., EJS)
app.set('view engine', 'ejs');


// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'AARAHANT_DB',
});

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.cookies.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Routes
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/', isLoggedIn, (req, res) => {
  res.redirect('/dashboard');
});

app.get('/login', (req, res) => {
  res.render('login', { error: "Login" });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.execute(`SELECT * FROM users WHERE username = '${username}' and password = '${password}'`);

    if (rows.length > 0) {
      const user = rows[0];
      res.cookie('user', user.id);
      res.redirect('/dashboard');
    } else {
      res.render('login', { error: 'Login Unsuccessful' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.render('login', { error: 'Login Unsuccessful' });
  }
});

app.get('/dashboard', isLoggedIn, async (req, res) => {
  const userId = parseInt(req.cookies.user);

  try {
    const [rows] = await pool.execute(`SELECT id, username, password FROM users WHERE id = ${userId}`);

    if (rows.length > 0) {
      const user = rows[0];
      res.render('dashboard', { user });
    } else {
      res.clearCookie('user');
      res.redirect('/login');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.clearCookie('user');
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('user');
  res.redirect('/login');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});