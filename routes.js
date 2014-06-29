var auth = require('./middlewares/authorization')
var mongoose = require('mongoose')
var User = mongoose.model('User')

module.exports = function (app, passport) {
	app.get('/', function (req, res) {
		res.render('landing')
	});

	// GOOGLE AUTH ROUTES

	// Redirect the user to Google for authentication.  When complete, Google
	// will redirect the user back to the application at
	//     /auth/google/return
	app.get('/auth/google', passport.authenticate('google'));

	// Google will redirect the user to this URL after authentication.  Finish
	// the process by verifying the assertion.  If valid, the user will be
	// logged in.  Otherwise, authentication has failed.
	app.get('/auth/google/return',
	  passport.authenticate('google', { successRedirect: '/authenticated',
	                                    failureRedirect: '/notauthenticated' }));

	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/authenticated',
		auth.requiresLogin,
		function (req, res) {
			User.findById(req.user._id, function(err, user) {
				if(err) {
					console.log(err);
					return;
				}

				if(user) {
					res.render('authenticated', {
						user: user
					});
				} else {
					res.send("No user");
				}
			});
	});

	app.get('/settings',
		auth.requiresLogin,
		function (req, res) {
			res.render('settings.jade', {
				user: req.user
			});
	});

	app.get('/notauthenticated', function (req, res) {
		res.send("Not authenticated")
	});

	app.post('/bookmark', function (req, res) {
		User.findById(req.body.key, function (err, user) {
			if(err) {
				console.log(err)
				return;
			}

			if(user) {
				user.bookmarks.push(req.body.bookmark);
				user.save();

				res.send("Ok!")
			} else {
				res.send("No user")
			}
		})
	})

	app.post('/folder', function (req, res) {
		User.findById(req.body.key, function (err, user) {
			if(err) {
				console.log(err)
				return;
			}

			if(user) {
				user.folders.push(req.body.folder);
				user.save();

				res.send("Ok!")
			} else {
				res.send("No user")
			}
		})
	})

	app.post('/remove', function (req, res) {
		User.findById(req.body.key, function (err, user) {
			if(err) {
				console.log(err)
				return;
			}


			if(user) {
				if(isFolder(user, req.body.id)) {
					User.findByIdAndUpdate(req.body.key,
						{
							$pull: {
								'bookmarks': {"parentId": req.body.id},
								'folders' : {"id": req.body.id}
							}
						}, function (err, doc) {
							if(err) {
								console.log(err);
								return;
							}

							res.send("Removed folder:" + req.body.id);
					});
				} else {
					User.findByIdAndUpdate(req.body.key,
						{
							$pull: {
								'bookmarks': {"id": req.body.id}
							}
						}, function (err, doc) {
							if(err) {
								console.log(err);
								return;
							}

							res.send("Removed bookmark:" + req.body.id);
					});
				}
			}
		})
	})

	app.post('/initial_remove', function (req, res) {
		User.findById(req.body.key, function (err, user) {
			if(err) {
				console.log(err)
				return;
			}

			if(user) {
				user.folders = [];
				user.bookmarks = [];

				user.save(function (err, user, updated) {
					if(err) {
						console.log(err);
						return;
					}

					if(updated === 0) {
						res.json({initial_remove: "ok"});
						return;
					}
				});
			}
		})
	})

	app.post('/bookmark_changed', function (req, res) {
		User.findById(req.body.key, function (err, user) {
			if(err) {
				console.log(err)
				return;
			}

			if(user) {
				if(isFolder(user, req.body.id)) {
					//update folders
					User.update({_id: mongoose.Types.ObjectId(req.body.key), "folders.id": req.body.id},
						{$set:{"folders.$.title": req.body.changed.title}}, function (err, number, raw) {
							if(err) {
								console.log(err);
								return;
							}

							res.json({bookmark_changed: "ok"});
					});
				} else {
					//update only bookmark
					User.update({_id: mongoose.Types.ObjectId(req.body.key), "bookmarks.id": req.body.id},
						{$set:{"bookmarks.$.title": req.body.changed.title, "bookmarks.$.url": req.body.changed.url}}, function (err, number, raw) {
							if(err) {
								console.log(err);
								return;
							}

							res.json({bookmark_changed: "ok"});
					});
				}
			}
		})
	})

	app.post('/bookmark_moved', function (req, res) {
		User.findById(req.body.key, function (err, user) {
			if(err) {
				console.log(err)
				return;
			}

			if(user) {
				if(isFolder(user, req.body.id)) {
					User.update({_id: mongoose.Types.ObjectId(req.body.key), "folders.id": req.body.id},
						{$set:{"folders.$.index": req.body.moved.index, "folders.$.parentId": req.body.moved.parentId}}, function (err, number, raw) {
							if(err) {
								console.log(err)
								return;
							}

							res.json({bookmark_moved: "ok"});
					});
				} else {
					User.update({_id: mongoose.Types.ObjectId(req.body.key), "bookmarks.id": req.body.id},
						{$set:{"bookmarks.$.index": req.body.moved.index, "bookmarks.$.parentId": req.body.moved.parentId}}, function (err, number, raw) {
							if(err) {
								console.log(err)
								return;
							}

							res.json({bookmark_moved: "ok"});
					});
				}
			}
		})
	})

	app.post('/folders', function (req, res) {
		User.findById(req.body.key, function (err, user) {
			if(err) {
				console.log(err)
				return;
			}

			if(user) {
				user.folders = req.body.folders;
				user.save(function (err) {
					if(err) {
						console.log(err)
						return;
					}

					res.json({folders: 'ok'});
				})
			}
		})
	})

	app.post('/bookmarks', function (req, res) {
		User.findById(req.body.key, function (err, user) {
			if(err) {
				console.log(err)
				return;
			}

			if(user) {
				User.update({_id: mongoose.Types.ObjectId(req.body.key)},
					{$push: {bookmarks: {$each: req.body.bookmarks}}}, function (err, number, raw) {
						if(err) {
							console.log(err)
							return;
						}
						res.json({bookmarks: 'ok'});
					});
			}
		})
	})

	app.get('/folders/:key', function (req, res) {
		User.findById(req.params.key, function (err, user) {
			if(err) {
				console.log(err)
				return;
			}

			if(user) {
				res.json(user.folders);
			}
		})
	})

	function isFolder (user, id) {
		//is the bookmark a folder?
		var isIdFolder = false;
		user.folders.every(function (folder) {
			if(folder.id === id) {
				isIdFolder = true;
				return false;
			}

			return true;
		});

		return isIdFolder;
	}
};
