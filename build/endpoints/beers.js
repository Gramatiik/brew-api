"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = beersEndpoints;

var _models = require("../models");

var _models2 = _interopRequireDefault(_models);

var _RequestBuilder = require("../helpers/RequestBuilder");

var _RequestBuilder2 = _interopRequireDefault(_RequestBuilder);

var _restify = require("restify");

var _restify2 = _interopRequireDefault(_restify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function beersEndpoints(server, passport) {

    /**
     * @api {get} /beers/count Get count
     * @apiName GetBeersCount
     * @apiGroup Beers
     * @apiVersion 0.1.0
     * @apiSuccess {Number} count number of beers
     */
    server.get('/beers/count', function (req, res, next) {
        _models2.default.Beer.count().then(function (count) {
            res.send({ count: count });
            return next();
        }).catch(function (err) {
            return next(err);
        });
    });

    /**
     * @api {get} /beers Get list
     * @apiName GetBeers
     * @apiGroup Beers
     * @apiVersion 0.1.0
     * @apiSuccess {Object[]} Beer list of beer response objects
     * @apiUse BeerResponseFields
     */
    server.get({
        url: '/beers',
        validation: {
            queries: {
                fields: { isRequired: false, regex: /^(([a-zA-Z0-9\-_],*)+|\*)$/, description: "Fields to include in response (comma separated)" },
                recursive: { isRequired: false, regex: /^(true|false)$/ },
                limit: { isRequired: false, isNumeric: true },
                offset: { isRequired: false, isNumeric: true },
                order: { isRequired: false, regex: /(^\w+:\w+$)/, description: "<field>:<ordering>" }
            }
        }
    }, function (req, res, next) {

        var query = new _RequestBuilder2.default(req, _models2.default, 'Beer', {
            include: [_models2.default.BreweryGeocode, _models2.default.Beer],
            defaultLimit: 10,
            maxLimit: 50
        }).enableFieldsSelection().enableRecursivity().enablePagination().enableOrdering().finalize();

        _models2.default.Brewery.findAll(query).then(function (breweries) {
            if (!breweries) {
                res.send(new _restify2.default.NotFoundError("No beers were found..."));
            } else {
                res.send(breweries);
            }
            return next();
        }).catch(function (err) {
            return next(err);
        });
    });

    /**
     * @api {get} /beers/:id Get single
     * @apiName GetBeer
     * @apiGroup Beers
     * @apiVersion 0.1.0
     * @apiSuccess {Object} Beer Beer response object
     * @apiUse BeerResponseFields
     */
    server.get({
        url: '/beers/:id',
        validation: {
            resources: {
                id: { isRequired: true, isNumeric: true }
            }
        }
    }, function (req, res, next) {
        _models2.default.Beer.findOne({
            where: {
                id: req.params.id
            },
            include: [_models2.default.Brewery, _models2.default.Category, _models2.default.Style]
        }).then(function (beer) {
            if (!beer) {
                var error = new _restify2.default.NotFoundError("Requested beer was not found");
                console.log(error);
                res.send(error);
            } else {
                res.send(beer.get({ plain: true }));
            }
            return next();
        }).catch(function (err) {
            return next(err);
        });
    });

    /**
     * @api {post} /beers/:id Update single
     * @apiName PostBeer
     * @apiGroup Beers
     * @apiVersion 0.1.0
     * @apiSuccess {Object} Beer Beer response object
     * @apiuse BeerPutParameters
     * @apiuse BeerResponseFields
     */
    server.post({
        url: '/beers',
        validation: {
            content: {
                //required parameters
                name: { isRequired: true },

                //optional parameters
                brewery_id: { isRequired: false, isNumeric: true },
                cat_id: { isRequired: false, isNumeric: true },
                style_id: { isRequired: false, isNumeric: true },
                abv: { isRequired: false, isNumeric: true },
                ibu: { isRequired: false, isNumeric: true },
                srm: { isRequired: false, isNumeric: true },
                upc: { isRequired: false, isNumeric: true },
                descript: { isRequired: false }
            }
        }
    }, function (req, res, next) {

        //enable jwt authentication for this endpoint
        passport.authenticate('jwt', { session: false }, function (info, user, err) {
            if (err) return next(err);
            req.user = user;
        })(req, res, next);

        //check if user group if authorized to access this endpoint
        if (!['admin', 'contributor'].includes(req.user.role)) {
            res.send(401, "Insufficient Permissions");
            return next();
        }

        _models2.default.Beer.build(req.body).save().then(function (newBeer) {
            res.send(newBeer);
            return next();
        }).catch(function (err) {
            return next(err);
        });
    });

    /**
     * @api {put} /beers/:id Update single
     * @apiName PutBeer
     * @apiGroup Beers
     * @apiVersion 0.1.0
     * @apiSuccess {Object} Beer Beer response object
     * @apiuse BeerPutParameters
     * @apiuse BeerResponseFields
     */
    server.put({
        url: '/beers/:id',
        validation: {
            resources: {
                id: { isRequired: true, isNumeric: true }
            },
            content: {
                brewery_id: { isRequired: false, isNumeric: true },
                name: { isRequired: false },
                cat_id: { isRequired: false, isNumeric: true },
                style_id: { isRequired: false, isNumeric: true },
                abv: { isRequired: false, isNumeric: true },
                ibu: { isRequired: false, isNumeric: true },
                srm: { isRequired: false, isNumeric: true },
                upc: { isRequired: false, isNumeric: true },
                descript: { isRequired: false }
            }
        }
    }, function (req, res, next) {
        _models2.default.Beer.findOne({
            where: {
                id: req.params.id
            },
            include: [_models2.default.Brewery, _models2.default.Category, _models2.default.Style]
        }).then(function (beer) {
            if (!beer) {
                res.send(new _restify2.default.NotFoundError("Requested beer was not found"));
            } else {
                beer.update(req.params).then(function (updatedBeer) {
                    res.send(updatedBeer);
                }).catch(function (err) {
                    return next(err);
                });
            }
            return next();
        }).catch(function (err) {
            return next(err);
        });
    });
}