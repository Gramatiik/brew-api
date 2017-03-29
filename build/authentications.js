"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = loadAuthentications;

var _passportHttp = require("passport-http");

var _passportHttp2 = _interopRequireDefault(_passportHttp);

var _passportJwt = require("passport-jwt");

var _passportJwt2 = _interopRequireDefault(_passportJwt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jwt_config = require(__dirname + "/config/jwt-config.json");
var BasicStrategy = _passportHttp2.default.BasicStrategy;
var JWTStrategy = _passportJwt2.default.Strategy;
var ExtractJwt = _passportJwt2.default.ExtractJwt;

/**
 * Define here all authentication methods available for the API
 * @example usage in endpoint file : "passport.authenticate('basic', { session: false })"
 * to use basic authentication on this specific endpoint, you cancahnge 'basic' for any other authentication
 * method that was loaded here
 * @param passport passport instance that will load anthentications
 * @param db database object
 */
function loadAuthentications(passport, db) {

    passport.use(new BasicStrategy(function (username, password, done) {
        db.User.findOne({
            where: {
                username: username,
                password: password
            }
        }).then(function (user) {
            return done(null, user);
        }).catch(function (err) {
            return done(null, false, { message: 'Invalid credentials.' });
        });
    }));

    //make parameters for jwt authentication
    var params = {
        secretOrKey: jwt_config["jwt-secret"],
        jwtFromRequest: ExtractJwt.fromUrlQueryParameter("token")
    };

    passport.use(new JWTStrategy(params, function (payload, done) {
        db.User.findOne({
            attributes: ['id', 'username', 'email', 'role'], //these are default fields
            where: {
                id: payload.id,
                username: payload.username
            }
        }).then(function (user) {
            return done(null, user);
        }).catch(function (err) {
            console.log(err);
            return done(null, false, { message: 'Error occured while fetching user.' });
        });
    }));
}