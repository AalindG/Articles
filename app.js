////////////////////
// import modules //
////////////////////
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash');
const config = require('./config/database')
const passport = require('passport');

////////////////
// DB Section //
////////////////

// define DB connection
mongoose.connect(config.database);
let db = mongoose.connection;

// check for an open connection
db.once('open', function(){
	console.log('Connection completed!');
})

// check for database errors
db.on('error', function(err){
	console.error(err);
})

////////////////////
// Initialize app //
////////////////////
const app = express();

/////////////////////////
// Bring in the models //
/////////////////////////
let Article = require('./models/article')
let User = require('./models/user');

// set body-parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

////////////////////////
// Express validation //
////////////////////////
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;

		while(namespace.length){
			formParam += '[' +namespace.shift()+ ']';
		}
		return{
			param	: formParam,
			msg 	: msg,
			value	: value
		}
	}
}));

//////////////////////////////
// Set public/static folder //
//////////////////////////////
app.use(express.static(path.join(__dirname,'public')));

////////////////////////////////
// Express Session Middleware //
////////////////////////////////
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

/////////////////////////////////
// Express Messages Middleware //
/////////////////////////////////
app.use(require('connect-flash')());
app.use(function (req, res, next) {
	// Setting a global variable 'messages' and requiring 'express-messages' here
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//////////////////////
// Set view engines //
//////////////////////
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

////////////////////////////
// Passport configuration //
////////////////////////////
require('./config/passport')(passport);
// passport middleware
app.use(passport.initialize());
app.use(passport.session());

///////////////////////////////////////////////////////////////////
// Setting up Global variable to check if we're logged in or not //
///////////////////////////////////////////////////////////////////
app.get('*', (req,res,next)=>{
	res.locals.user = req.user || null;
	// console.log(req.user);
	next();
})

////////////
// Routes //
////////////

// home route
app.get('/', (req, res)=>{
	// get data from models defined above
	Article.find({}, function(err, articles){
		console.log('Articles ',articles);
		User.findById(articles.author, function(err, user){
			if(err){
				console.log('Error on home page: ', err);
			}else{
				console.log('User',user);
				res.render('index', {
					title: 'Articles',
					author: user,
					articles: articles
				});
		}
		})
	});
});

////////////////////////////////////////////////////////////////////////
// Setting up routes from Route File, and then using it as middleware //
////////////////////////////////////////////////////////////////////////

let articles = require('./routes/articles');
let users = require('./routes/users')
// using the routes 
app.use('/articles', articles);
app.use('/users', users)


// Starting server on a specific port
app.listen(8888, function(){
	console.log('Server in up  & running...');
})

