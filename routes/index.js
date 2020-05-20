var express = require('express');
var router = express.Router();
var mysql = require('mysql');


var fs = require('fs');
var Cart = require('../models/cart');
var products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8')); 

// Create connection to Database
var connection = mysql.createPool({
	host     : 'us-cdbr-east-06.cleardb.net',
	user     : 'b8f2187a505a7d',
	password : 'c11b1197',
	database : 'heroku_853a6dc38004aa3'
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

router.get('/', function (req, res, next) {
  res.render('index', 
  { 
    products: products,
    user: req.session.username
  }
  );
});

router.get('/login',
  function(req, res){
    res.render('login');
  });

router.get('/signin',
  function(req, res){
    res.render('signin');
  });

  router.post('/signin',function(req, res, next) {
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

router.post('/login', 
  function(req, res) {
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
  
router.get('/logout',
  function(req, res){
    req.session.loggedin = false;
    req.session.username = null;
    req.session.password = null;
    res.redirect('/');
  });

router.get('/add/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  var product = products.filter(function(item) {
    return item.id == productId;
  });
  cart.add(product[0], productId);
  req.session.cart = cart;
  res.redirect('/');
});

router.get('/cart', function(req, res, next) {
  if (!req.session.cart) {
    return res.render('cart', {
      products: null
    });
  }
  var cart = new Cart(req.session.cart);
  res.render('cart', {
    products: cart.getItems(),
    totalPrice: cart.totalPrice
  });
});

router.get('/remove/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.remove(productId);
  req.session.cart = cart;
  res.redirect('/cart');
});

router.get('/checkout',function(req,res){
  res.render("checkout")
})


module.exports = router;
