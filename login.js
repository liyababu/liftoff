var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var path = require('path');

const { body, validationResult } = require('express-validator');

const ifLoggedin = (req,res,next) => {
    if(req.session.isLoggedIn){
        return res.redirect('/index');
    }
    next();
}
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



// var sql = "INSERT INTO login (username, password) VALUES ('immu165', 'liya@123')";
// connection.query(sql, function (err, result) {
//   if (err) throw err;
//   console.log("1 record inserted");
// });

// let sql = `SELECT * FROM accounts`;
// connection.query(sql, (error, results, fields) => {
//   if (error) {
//     return console.error(error.message);
//   }
// //   console.log(results.length);
//   console.log(results);
// });

//Intialise Express sessions and requests
var app = express();

//let Express know we'll be using some of its packages
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(__dirname+'/images'));

//Handle home page
app.get('/', function (request, response) {  
	console.log("4");
	response.sendFile( __dirname + "/" + "index.html" );  
 }) 

 //Handle Login Page
 app.get('/login', function (request, response) {  
	console.log("8");
	response.sendFile( __dirname + "/" + "login.html" );  
 }) 

 //Handle Sign Up page
 app.get('/signin', function (request, response) {  
	console.log("9");
	response.sendFile( __dirname + "/" + "signin.html" );  
 }) 
app.get('/index', function(request, response) {
	console.log("6");
	if (!request.session.loggedin) {
		console.log("7");
		response.send("please login");
	} else {		
		return response.sendFile( __dirname + "/" + "index.html" );
	}
	response.end();
});


// //Display login file to clients
// app.get('/', function(request, response) {
// 	console.log("3");
// 	response.sendFile(path.join(__dirname + '/index.html'));
// 	//Disable login and Show username
// });


 

// We need to now handle the POST request, basically 
// what happens here is when the client enters their details in the login form and clicks the submit button, 
//the form data will be sent to the server, and with that data our login script 
// will check in our MySQL accounts table to see if the details are correct.
app.post('/auth', function(request, response) {
	console.log("5");
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				console.log("Start redirection");
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect("/index");
				response.end();
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/signauth',function(request, response, next) {
    var username = request.body.username;
    var email = request.body.email;
    var password = request.body.password;
  if(username && email && password != 0){
	  console.log("10")
  var sql = "INSERT INTO `accounts`(`username`,`password`, `email`) VALUES ('"+username+"','"+password+"','"+email+"')";
  connection.query(sql, function(err, result)  {
	if (username && email && password != 0) {
		console.log("Start redirection");
		response.redirect("/login");
		response.end();
	} else {
response.send('Please enter Username and Password!');
response.end();
	}
});
  }
});


//To listen on a port

app.listen(3000);
