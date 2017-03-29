"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = usersEndpoints;

var _models = require("../models");

var _models2 = _interopRequireDefault(_models);

var _RequestBuilder = require("../helpers/RequestBuilder");

var _RequestBuilder2 = _interopRequireDefault(_RequestBuilder);

var _restify = require("restify");

var _restify2 = _interopRequireDefault(_restify);

var _md = require("md5");

var _md2 = _interopRequireDefault(_md);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function usersEndpoints(server, passport) {

    /**
     * @api {get} /users/count Get count
     * @apiName GetUsersCount
     * @apiGroup Users
     * @apiVersion 0.1.0
     * @apiSuccess {Number} count number of users
     */
    server.get('/users/count',

    //this endpoint needs jwt token
    passport.authenticate('jwt', { session: false }), function (req, res, next) {
        _models2.default.User.count().then(function (count) {
            console.log(count);
            res.send({ count: count });
            return next();
        }).catch(function (err) {
            return next(err);
        });
    });

    /**
     * @api {get} /users Get list
     * @apiName GetUsers
     * @apiGroup Users
     * @apiVersion 0.1.0
     * @apiSuccess {Object[]} User
     * @apiUse UserResponseFields
     */
    server.get({
        url: '/users',
        validation: {
            queries: {
                fields: { isRequired: false, regex: /^(([a-zA-Z0-9\-_],*)+|\*)$/ },
                recursive: { isRequired: false, regex: /^(true|false)$/ },
                limit: { isRequired: false, isNumeric: true },
                offset: { isRequired: false, isNumeric: true },
                order: { isRequired: false, regex: /(^\w+:\w+$)/ }
            }
        }
    }, function (req, res, next) {

        //enable jwt authentication for this endpoint
        passport.authenticate('jwt', { session: false }, function (info, user, err) {
            if (err) return next(err);

            //check if user group is authorized to access this endpoint
            if (!['admin'].includes(user.role)) {
                res.send(401, "Insufficient Permissions");
                return next();
            }

            var query = new _RequestBuilder2.default(req, _models2.default, 'User', {
                attributes: ['id', 'username', 'email', 'role'], //these are default fields
                defaultLimit: 10,
                maxLimit: 25
            }).enableFieldsSelection().enablePagination().enableOrdering().finalize();

            _models2.default.User.findAll(query).then(function (users) {
                if (!users) {
                    res.send(new _restify2.default.NotFoundError("No users were found..."));
                } else {
                    res.send(users);
                }
                return next();
            }).catch(function (err) {
                return next(err);
            });
        })(req, res, next);
    });

    /**
     * @api {get} /users/name/:username Get single - by username
     * @apiName GetUserByUsername
     * @apiGroup Users
     * @apiVersion 0.1.0
     * @apiSuccess {Object} User
     * @apiUse UserResponseFields
     */
    server.get({
        url: '/users/name/:username',
        validation: {
            resources: {
                username: { isRequired: true, isAlpha: true }
            }
        }
    }, function (req, res, next) {

        //enable jwt authentication for this endpoint
        passport.authenticate('jwt', { session: false }, function (info, user, err) {
            if (err) return next(err);

            _models2.default.User.findOne({
                where: {
                    username: req.params.username
                },
                attributes: ['id', 'username', 'email', 'role'] //these are default fields
            }).then(function (user) {
                if (!user) {
                    res.send(new _restify2.default.NotFoundError("Requested user was not found"));
                } else {
                    res.send(user.get({ plain: true }));
                }
                return next();
            }).catch(function (err) {
                return next(err);
            });
        })(req, res, next);
    });

    /**
     * @api {get} /users/:id Get single - by id
     * @apiName GetUserById
     * @apiGroup Users
     * @apiVersion 0.1.0
     * @apiSuccess {Object} User
     * @apiUse UserResponseFields
     */
    server.get({
        url: '/users/:id',
        validation: {
            resources: {
                id: { isRequired: true, isNumeric: true }
            }
        }
    }, function (req, res, next) {

        //enable jwt authentication for this endpoint
        passport.authenticate('jwt', { session: false }, function (info, user, err) {
            if (err) return next(err);

            //check if user group is authorized to access this endpoint
            if (!['admin'].includes(user.role)) {
                res.send(401, "Insufficient Permissions");
                return next();
            }

            _models2.default.User.findOne({
                where: {
                    id: req.params.id
                },
                attributes: ['id', 'username', 'email', 'role'] //these are default fields
            }).then(function (user) {
                if (!user) {
                    res.send(new _restify2.default.NotFoundError("Requested user was not found"));
                } else {
                    res.send(user.get({ plain: true }));
                }
                return next();
            }).catch(function (err) {
                return next(err);
            });
        })(req, res, next);
    });

    /**
     * @api {post} /users Create single
     * @apiName PostUser
     * @apiGroup Users
     * @apiVersion 0.1.0
     * @apiSuccess {Object} User Created user informations
     * @apiUse UserResponseFields
     */
    server.post({
        url: '/users',
        validation: {
            content: {
                //required parameters
                username: { isRequired: true },
                email: { isRequired: true, isEmail: true },
                password: { isRequired: true }
            }
        }
    }, function (req, res, next) {

        //hash password before saving
        req.body.password = (0, _md2.default)(req.body.password);

        _models2.default.User.build(req.body).save().then(function (newUser) {
            res.send(newUser);
        }).catch(function (err) {
            return next(err);
        });
    });

    /**
     * @api {put} /users/:id Update single
     * @apiName PutUser
     * @apiGroup Users
     * @apiVersion 0.1.0
     * @apiSuccess {Object} User Updated user informations
     * @apiUse UserResponseFields
     * @apiuse UserUpdateParameters
     */
    server.put({
        url: '/users/:id',
        validation: {
            resources: {
                id: { isRequired: true, isRegex: /^([0-9]+|me)$/ }
            },
            content: {
                username: { isRequired: false },
                email: { isRequired: false, isEmail: true },
                password: { isRequired: false }
            }
        }
    }, function (req, res, next) {

        //enable jwt authentication for this endpoint
        passport.authenticate('jwt', { session: false }, function (info, user, err) {
            if (err) return next(err);

            if (req.params.id === "me") req.params.id = user.id;

            //check if user attempts to edit his own data or is member of admin group
            if (req.params.id !== user.id || !['admin'].includes(user.role)) {
                res.send(401, "Insufficient Permissions");
                return next();
            }

            if (req.body.role) delete req.body.role;

            //hash new password if present
            if (req.body.password) req.body.password = (0, _md2.default)(req.body.password);

            _models2.default.User.findOne({
                where: {
                    id: req.params.id
                },
                attributes: ['id', 'username', 'email', 'role'] //these are default fields
            }).then(function (user) {
                //update given fields
                user.update(req.body).then(function (user) {
                    res.send(user);
                    return next();
                }).catch(function (err) {
                    return next(err);
                });
            }).catch(function (err) {
                return next(err);
            });
        })(req, res, next);
    });
}