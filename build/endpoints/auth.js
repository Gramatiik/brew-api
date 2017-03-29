"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = authEndpoints;

var _models = require("../models");

var _models2 = _interopRequireDefault(_models);

var _jwtSimple = require("jwt-simple");

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _md = require("md5");

var _md2 = _interopRequireDefault(_md);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jwtConfig = require(__dirname + "/../config/jwt-config.json");

function authEndpoints(server) {

    server.post({
        url: "/auth/jwt",
        validation: {
            content: {
                username: { isRequired: true },
                password: { isRequired: true }
            }
        }
    }, function (req, res, next) {

        //grab username and password
        var username = req.body.username;
        var password = req.body.password;

        //try to find matching user
        _models2.default.User.findOne({
            where: {
                username: username,
                password: (0, _md2.default)(password)
            }
        }).then(function (user) {
            if (!user) {
                res.send({
                    message: "Invalid credentials"
                });
            } else {
                //generate token
                var now = Math.round(new Date().getTime() / 1000);

                var payload = {
                    iat: now,
                    exp: now + 60 * 60, //TODO : make expiration time configurable
                    id: user.id,
                    username: user.username,
                    role: user.role
                };

                var token = _jwtSimple2.default.encode(payload, jwtConfig["jwt-secret"], 'HS256', {});

                res.send({ token: token });
            }

            return next();
        }).catch(function (err) {
            return next(err);
        });
    });
}