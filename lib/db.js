var OAuth2 = require('oauth').OAuth2;
var request = require('request');
var qs = require('querystring');

var storage = {
	users: [
		{
			name: 'Tim A',
			session: '1',
			answers: [1, null, null]
		},
		{
			name: 'Jersome',
			session: '2',
			answers: [1, null, null]
		},
		{
			name: null,
			session: '3',
			answers: [1, null, null]
		}
	],
	quiz: {
		title: 'Food Rules!',
		questions: [
			{
				title: 'What was the year of food crisis?',
				answers: [
					'2001',
					'2008',
					'2012',
					'1995'
				]
			},
			{
				title: 'How many people could we have fed with the food grown that year?',
				answers: [
					'Nobody, it was all animal feed.',
					'All of Europe',
					'11 Million',
					'5 Million'
				]
			},
			{
				title: 'How much do we feed to animals?',
				answers: [
					'One Half',
					'100%',
					'1/3'
				]
			}
		]
	}
};

module.exports = function(app) {

	// Usergrid

	function cleanSession(session) {
		session = session.replace(/[^a-z0-9]/gi, '');
		console.log(session);
		return session.substr(0, 8);
	}

	function entityToUser(entity) {
		return {
			session: entity.username,
			answers: entity.answers || [],
			name: entity.name,
			telephone: entity.telephone || undefined,
			attToken: entity.attToken || undefined,
			attRefreshToken: entity.attRefreshToken || undefined
		};
	}

	 var apigUrl = 'http://api.usergrid.com/' + process.env.APIG_APP + '/';
	 var apig = new OAuth2(process.env.APIG_ID, process.env.APIG_SECRET, apigUrl, 'token', 'token');

	 var apigToken = null;
	 apig.getOAuthAccessToken('', {
		grant_type: 'client_credentials'
	 }, function(err, access_token) {
		apigToken = access_token;
	 });

	var db = {

		getUsers: function(done) {
			var requestUrl = apigUrl + 'users?ql=online=1&limit=999';
			request.get(requestUrl, function(err, r, data) {
				if (err) {
					console.log('ERROR: ' + err);
					return;
				}
				var users = [];
				data = JSON.parse(data);
				data.entities.forEach(function(entity) {
					users.push(entityToUser(entity))
				});
				done(null, users);
			});
		},

		createUser: function(session, done) {
			console.log('create user');
			var user = {
				username: session,
				name: null,
				email: null,
				password: null
			};
			request.post(apigUrl + 'users', {
					body: JSON.stringify(user),
					headers: {
						'content-type': 'application/json'
					}
			}, function(err, r, data) {
				if (err) {
					console.log('ERROR: ' + err);
					return;
				}
				done(null, {
					session: session,
					answers: [],
					name: ''
				});
			});
		},

		getUserBySession: function(session, done) {
			session = cleanSession(session);
			var requestUrl = apigUrl + 'users/' + session;
			request.get(requestUrl, function(err, r, data) {

				if (err) {
					console.log('ERROR: ' + err);
					//this.createUser(session, done);
					return;
				}

				var data = JSON.parse(data);
				if (data.entities && data.entities.length) {
					console.log('found user');
					var entity = data.entities[0];
					done(null, entityToUser(entity));
				} else {
					this.createUser(session, done);
				}
			}.bind(this));
		},

		getQuiz: function(done) {
			done(null, storage.quiz);
		},

		saveUser: function(sessionId, values, done) {
			var requestUrl = apigUrl + 'users/' + encodeURIComponent(cleanSession(sessionId));
			console.log('saveUser:sessionId', sessionId);
			console.log('savinging user to: ' + requestUrl);
			console.log(values);
			request.put(requestUrl, {
				body: JSON.stringify(values),
				headers: {
					'content-type': 'application/json'
				}
			}, function(err, r, data) {
				if (err) {
					console.log('ERROR: ' + err);
					return;
				}
				data = JSON.parse(data);
				if (!data.entities) {
					console.log(data);
					console.log('ERROR: No entities returned when saving user!');
					return;
				}
				done(null, entityToUser(data.entities[0]));
			});
		},

		deleteAll: function() {
			var requestUrl = apigUrl + 'users?limit=999';
			request.get(requestUrl, function(err, r, data) {
				if (err) {
					console.log('ERROR: ' + err);
					return;
				}
				data = JSON.parse(data);
				data.entities.forEach(function(entity) {
					var id = entity.uuid;
					request.del(apigUrl + 'user/' + id, function(err, r, data) {
						console.log('deleted');
						console.log(data);
					});
				});
			});

		}
	};

	return db;

};