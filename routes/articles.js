const express = require('express');
const router = express.Router();

/////////////////////////
// Bring in the models //
/////////////////////////
let Article = require('../models/article')
let User = require('../models/user')

// add_article route
router.get('/add', ensureAuthenticated ,(req,res)=>{


	Article.find({}, function(err, articles){
		if(err){
			console.log('Error in "add articles": ', err);
		}else{
			res.render('article_add', {
				title: 'Add your articles',
				articles: articles
			});
		}
	});
});



// Add an article
router.post('/add', ensureAuthenticated, function(req, res){
	// Validations
	req.checkBody('title', 'Title is required').notEmpty();
	// req.checkBody('author', 'Author Name is required').notEmpty();
	req.checkBody('body', 'Context is a must').notEmpty();

	let errors = req.validationErrors();

	Article.find({}, function(err, articles){
		if(errors){
			res.render('article_add', {
					title: 'Add your articles',
					articles: articles,
					errors: errors
				});
		}else{
			let newArticle	= new Article();
			newArticle.title = req.body.title;
			newArticle.author = req.user._id;
			newArticle.body = req.body.body;

			newArticle.save(function(err){
				if(err){
					console.log('Error in the post method: ', err);
					return;
				}else{
					req.flash('success', 'Article Added Successfully!')
					res.redirect('/')
				}
			})
		}
	})

})

// get individual article
router.get('/:id', function(req, res){
	Article.findById(req.params.id, function(err,article){
		// "article.author" is stored as id of the user who created that particular article
		User.findById(article.author, function(err, user){
			if(err){
				console.log('Error inside article',err)
			}else{
				res.render('article',{
					article:article,
					author: user.name
				})
			}			
		})

	})	
});

// edit article
router.get('/edit/:id', function(req, res){
	console.log(req.user)
	req.checkBody('title', 'Title is required').notEmpty();
	// req.checkBody('author', 'Author Name is required').notEmpty();
	req.checkBody('body', 'Context is a must').notEmpty();

	let errors = req.validationErrors();
	Article.findById(req.params.id, function(err,article){
		if(article.author != req.user.id){
			req.flash('danger', "You're not authenticated to edit this article");
			res.redirect('/')
		}
		if(err){
			console.log('Error in the edit method: ', err);
		}else{
			if(errors){
				res.render('edit_article',{
					title:'Edit Article',
					article:article,
					errors:errors
				});
			}else{
				res.render('edit_article',{
					title:'Edit Article',
					article:article
				})
			}
		}
	})
	
});

// update article in DB
router.post('/edit/:id', function(req, res){
	
	let newArticle = {};
	newArticle.title = req.body.title;
	newArticle.author = req.user._id;
	newArticle.body = req.body.body;

	// Establish a Query which finds the object in the DB to be updated
	let query = {_id:req.params.id}

	Article.update(query, newArticle, function(err){
		if(err){
			console.log('Error in the update method: ', err);
			return;
		}
		res.redirect('/')
	})
});

// 
// deleting an article in DB
router.delete('/:id', function(req, res){
	
	// Establish a Query which finds the object in the DB to be deleted
	let query = {_id:req.params.id};

	Article.remove(query, function(err){
		if(err){
			console.log('Error in the update method: ', err);
			return;
		}
		res.send('Success!')
	})
});


//////////////////////////////////////////////////////////
// Function to check if user is logged in or registered //
//////////////////////////////////////////////////////////
function ensureAuthenticated(req,res,next){
	if(req.isAuthenticated()){
		next()
	}else{
		req.flash('danger', 'Please Login First!');
		res.redirect('/users/login')
	}
}

//////////////////////////////////
// Exporting the article routes //
//////////////////////////////////

module.exports = router;