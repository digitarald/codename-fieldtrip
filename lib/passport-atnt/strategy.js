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
  options = options || {};
  options.baseSite = 'https://api.att.com/';
  options.authorizationURL = options.authorizationURL || options.baseSite + 'oauth/authorize';
  options.tokenURL = options.tokenURL || options.baseSite + 'oauth/access_token';
  options.apiVersion = options.apiVersion || '20120504';
  options.scopeSeparator = options.scopeSeparator || ',';
  options.skipUserProfile = true;

  OAuth2Strategy.call(this, options, verify);
  this.name = 'atnt';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

// Strategy.prototype.userProfile = function(accessToken, done){
//     this._oauth2.getProtectedResource('', accessToken, function(err, body, res){
//         if (err) return done(new InternalOAuthError('failed to fetch user profile', err));

//         try {
//             var json = JSON.parse(body);

//             var profile = json;

//             done(null, profile);
//         } catch(e) {
//             done(e);
//         }
//     });
// }

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
