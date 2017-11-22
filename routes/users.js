const express = require('express');
const router = express.Router();
// getting bcrypt to encrypt our form
const bcrypt = require('bcryptjs')
const passport = require('passport');

/////////////////////////
// Bring in the models //
/////////////////////////
let User = require('../models/user');

router.get('/register', function(req,res){
	res.render('register');
})

router.post('/register', (req,res)=>{
	// get values from view/form
	const name = req.body.name;
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	const password2 = req.body.password2;

	// check for errors
	req.checkBody('name', 'Name is needed').notEmpty();
	req.checkBody('email', 'Email is needed').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is needed').notEmpty();
	req.checkBody('password', 'Password is needed').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	let errors = req.validationErrors();

	if(errors){
		res.render('register', {
			errors: errors
		});
	}else{
		let newUser = new User({
			name:name,
			email:email,
			username:username,
			password:password,
		});

		bcrypt.genSalt(10, function(err,salt){
			bcrypt.hash(newUser.password, salt, function(err,hash){
				if(err){
					console.log('Error in hashing: ', err);
				}
				newUser.password = hash;
				newUser.save(function(err){
					if(err){
						console.log('Error while saving info: ',err);
					}else{
						req.flash('success', 'You are now registered! Yay!');
						res.redirect('/users/login')
					}
				})
			})
		})
	}
});

// Login form
router.get('/login', (req,res)=>{
	res.render('login');
});

// Login POST
router.post('/login', (req,res,next)=>{
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req,res,next);
});

// Logout Method
router.get('/logout', function(req,res){
	req.logout();
	req.flash('success', "You've been successfully logged out!")
	res.redirect('/users/login')
})

module.exports = router;