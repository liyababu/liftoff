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

connection.getConnection(function(err, connection) {
  if (err) throw err; // not connected!

  // Use the connection
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
  var sql = "INSERT INTO `accounts`(`username`,`password`, `email`) VALUES ('"+username+"','"+password+"','"+email+"')";
  connection.query(sql, function(err, result)  {
	if (username && email && password != 0) {
		console.log("Start redirection");
		res.redirect("/login");
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
    req.session.cart= null;
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

// router.get('/checkout',function(req,res){
//   res.render("checkout")
// })
router.get('/checkout',  function(req, res, next) {
  if (!req.session.cart) {
      return res.redirect('/');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error');
  res.render('/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', function(req, res, next) {
  if (!req.session.cart) {
      return res.redirect('/');
  }
  var cart = new Cart(req.session.cart);
  
  var stripe = require("stripe")(
      "sk_test_fwmVPdJfpkmwlQRedXec5IxR"
  );

  stripe.charges.create({
      amount: cart.totalPrice * 100,
      currency: "usd",
      source: req.body.stripeToken, // obtained with Stripe.js
      description: "Test Charge"
  }, function(err, charge) {
      if (err) {
          req.flash('error', err.message);
          return res.redirect('/checkout');
      }
      var order = new Order({
          user: req.user,
          cart: cart,
          address: req.body.address,
          name: req.body.name,
          paymentId: charge.id
      });
      order.save(function(err, result) {
          req.flash('success', 'Successfully bought product!');
          req.session.cart = null;
          res.redirect('/');
      });
  }); 
});

module.exports = router;
