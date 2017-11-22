const mongoose = require('mongoose');

// Article Schema
let articleSchema = mongoose.Schema({
	id:{
		type: Number
	},
	title:{
		type: String,
		required: true
	},
	author: {
		type:String,
		required:true
	},
	body: String
});

// exporting our schema
let Article = module.exports = mongoose.model('Article', articleSchema)