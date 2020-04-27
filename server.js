var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var path = require('path');



// Create connection to Database
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'liyababu',
	password : 'Liya@262165',
	database : 'nikhiltry'
});

connection.connect(function(err) {
    // in case of error
    if(err){
        console.log(err.code);
        console.log(err.fatal);
	}
	else{
		console.log("Connection to database success");	
	}

});


//Intialise Express sessions and requests
var app = express();

//let Express know we'll be using some of its packages
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(express.static('public'));
app.use(function(req, res, next) {
  res.locals.user = req.session.username;
  next();
});

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
  function(req, res) {
    var val = req.session.username;
    console.log("At home")
    res.render('home', { user: val});
  });



app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/signin',
  function(req, res){
    res.render('signin');
  });

  app.post('/signin',function(req, res, next) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
  if(username && email && password != 0){
	  console.log("10")
  var sql = "INSERT INTO `accounts`(`username`,`password`, `email`) VALUES ('"+username+"','"+password+"','"+email+"')";
  connection.query(sql, function(err, result)  {
	if (username && email && password != 0) {
		console.log("Start redirection");
		res.redirect("/");
		res.end();
	} else {
res.send('Please enter Username and Password!');
res.end();
	}
});
  }
});

  app.post('/login', 
  function(req, res) {
    console.log("5");
    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
      connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
        if (results.length > 0) {
          console.log("Start redirection");
          req.session.loggedin = true;
          req.session.username = username;
          console.log(req.session.username)
          res.redirect("/");
          res.end();
        } else {
          res.send('Incorrect Username and/or Password!');
        }			
        res.end();
      });
    } else {
      res.send('Please enter Username and Password!');
      res.end();
    }
  });
  
app.get('/logout',
  function(req, res){
    req.session.loggedin = false;
    req.session.username = null;
    req.session.password = null;
    console.log("logout")
    res.redirect('/');
  });
app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.listen(3000);
