import db from "../models";
import RequestBuilder from "../helpers/RequestBuilder";
import restify from "restify";
import md5 from "md5";

export default function usersEndpoints(server, passport) {

    /**
     * @api {get} /users/count Get count
     * @apiName GetUsersCount
     * @apiGroup Users
     * @apiVersion 0.1.0
     * @apiSuccess {Number} count number of users
     */
    server.get('/users/count',

        //this endpoint needs jwt token
        passport.authenticate('jwt', { session: false }),

        (req, res, next) => {
        db.User.count().then( function(count) {
            console.log(count);
            res.send({count: count});
            return next();
        }).catch( (err) => {
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
                    recursive: { isRequired: false, regex: /^(true|false)$/},
                    limit: { isRequired: false, isNumeric: true },
                    offset: { isRequired: false, isNumeric: true },
                    order: { isRequired: false, regex: /(^\w+:\w+$)/ }
                }
            }
        },
        (req, res, next) => {

            //enable jwt authentication for this endpoint
            passport.authenticate('jwt', { session: false }, (info, user, err) => {
                if(err) return next(err);

                //check if user group is authorized to access this endpoint
                if(!['admin'].includes(user.role)) {
                    res.send(401, "Insufficient Permissions");
                    return next();
                }

                let query = new RequestBuilder(req, db, 'User', {
                    attributes: [ 'id', 'username', 'email', 'role' ], //these are default fields
                    defaultLimit: 10,
                    maxLimit: 25
                })  .enableFieldsSelection()
                    .enablePagination()
                    .enableOrdering()
                    .finalize();

                db.User.findAll(query).then( (users) => {
                    if(!users) {
                        res.send(new restify.NotFoundError("No users were found..."));
                    } else {
                        res.send(users);
                    }
                    return next();
                }).catch( (err) => {
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
        }, (req, res, next) => {

            //enable jwt authentication for this endpoint
            passport.authenticate('jwt', { session: false }, (info, user, err) => {
                if(err) return next(err);

                db.User.findOne({
                    where: {
                        username: req.params.username
                    },
                    attributes: [ 'id', 'username', 'email', 'role' ] //these are default fields
                }).then( (user) => {
                    if(!user) {
                        res.send(new restify.NotFoundError("Requested user was not found"));
                    } else {
                        res.send(user.get({plain: true}));
                    }
                    return next();
                }).catch( (err) => {
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
        },
        (req, res, next) => {

            //enable jwt authentication for this endpoint
            passport.authenticate('jwt', { session: false }, (info, user, err) => {
                if (err) return next(err);

                //check if user group is authorized to access this endpoint
                if (!['admin'].includes(user.role)) {
                    res.send(401, "Insufficient Permissions");
                    return next();
                }

                db.User.findOne({
                    where: {
                        id: req.params.id
                    },
                    attributes: [ 'id', 'username', 'email', 'role' ] //these are default fields
                }).then( (user) => {
                    if(!user) {
                        res.send(new restify.NotFoundError("Requested user was not found"));
                    } else {
                        res.send(user.get({plain: true}));
                    }
                    return next();
                }).catch( (err) => {
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
    },
        (req, res, next) => {

        //hash password before saving
        req.body.password = md5(req.body.password);

        db.User.build(req.body)
            .save()
            .then( (newUser) => {
                res.send(newUser);
            }).catch( (err) => {
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
                id: { isRequired: true, isNumeric: true }
            },
            content: {
                username: { isRequired: false },
                email: { isRequired: false, isEmail: true },
                password: { isRequired: false }
            }
        }
    },
        (req, res, next) => {

            //enable jwt authentication for this endpoint
            passport.authenticate('jwt', { session: false }, (info, user, err) => {
                if(err) return next(err);
                req.user = user;

                //check if user attempts to edit his own data
                if(req.params.id !== user.id) {
                    res.send(401, "Insufficient Permissions");
                    return next();
                }

                //hash new password if present
                    if(req.body.password) req.body.password = md5(req.body.password);

                db.User.findOne({
                    where: {
                        id: req.params.id
                    },
                    attributes: [ 'id', 'username', 'email', 'role' ] //these are default fields
                })
                    .then( (user) => {
                        //update given fields
                        user.update(req.body)
                            .then( (user) => {
                                res.send(user);
                                return next();
                            }).catch( (err) => {
                            return next(err);
                        });
                    }).catch( (err) => {
                    return next(err);
                });

            })(req, res, next);
    });
}
