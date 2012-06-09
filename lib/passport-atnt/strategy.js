/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Fourquare authentication strategy authenticates requests by delegating to
 * Foursquare using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Foursquare application's App ID
 *   - `clientSecret`  your Foursquare application's App Secret
 *   - `callbackURL`   URL to which Foursquare will redirect the user after granting authorization
 *   - `apiVersion`    the Foursquare API version to use for requesting the user profile
 *
 * Examples:
 *
 *     passport.use(new FoursquareStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/foursquare/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  var scope = 'scope';

  options = options || {};

  scope += options.scope ? options.scope.join(',') : '';

  options.authorizationURL = options.authorizationURL || 'https://api.att.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://api.att.com/oauth2/access_token';
  options.apiVersion = options.apiVersion || '20120504';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'atnt';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
