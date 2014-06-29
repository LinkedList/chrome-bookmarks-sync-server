var mongoose = require('mongoose');
var Schema = mongoose.Schema;

if(process.env.NODE_ENV === 'production') {
	mongoose.connect('mongodb://production_connection_string');
} else {
	mongoose.connect('mongodb://localhost/chrome_bookmarks');
}



var UserSchema = new Schema({
	provider: String,
	id: String,
	displayName: String,
	identifier: String,
	emails: [{
			value: String,
			type: {type: String}
		}],
	bookmarks: [{
		dateAdded: Number,
		id: String,
		index: Number,
		parentId: String,
		title: String,
		url: String,
	}],
	folders: [{
		dateAdded: Number,
		id: String,
		index: Number,
		parentId: String,
		title: String,
		url: String,
	}]
});

var User = mongoose.model('User', UserSchema);
