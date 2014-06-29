var express = require('express');
var passport = require('passport')

var app = express();

require('./config/database');

app.configure(function() {
	app.use(express.static('static'));
	app.set('view engine', 'jade');
	app.set('views', __dirname + '/views');
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.session({ secret: 'keyboard cat' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
});

require('./config/passport')(passport)
var routes = require('./routes')(app, passport);

app.listen(process.env.PORT || 3000);
console.log('Server started');
