"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = breweriesEndpoints;

var _models = require("../models");

var _models2 = _interopRequireDefault(_models);

var _RequestBuilder = require("../helpers/RequestBuilder");

var _RequestBuilder2 = _interopRequireDefault(_RequestBuilder);

var _restify = require("restify");

var _restify2 = _interopRequireDefault(_restify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function breweriesEndpoints(server, passport) {

    /**
     * @api {get} /breweries/count Get count
     * @apiName GetBreweriesCount
     * @apiGroup Breweries
     * @apiVersion 0.1.0
     * @apiSuccess {Number} count number of breweries
     */
    server.get('/breweries/count', function (req, res, next) {
        _models2.default.Brewery.count().then(function (count) {
            console.log(count);
            res.send({ count: count });
            return next();
        }).catch(function (err) {
            return next(err);
        });
    });

    /**
     * @api {get} /breweries Get list
     * @apiName GetBrewery
     * @apiGroup Breweries
     * @apiVersion 0.1.0
     * @apiSuccess {Object[]} Brewery Brewery response object
     * @apiUse BreweryResponseFields
     */
    server.get({
        url: '/breweries',
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

        var query = new _RequestBuilder2.default(req, _models2.default, 'Brewery', {
            include: [_models2.default.BreweryGeocode, _models2.default.Beer],
            defaultLimit: 20,
            maxLimit: 50
        }).enableFieldsSelection().enableRecursivity().enablePagination().enableOrdering().finalize();

        _models2.default.Brewery.findAll(query).then(function (breweries) {
            if (!breweries) {
                res.send(new _restify2.default.NotFoundError("No breweries were found..."));
            } else {
                res.send(breweries);
            }
            return next();
        }).catch(function (err) {
            return next(err);
        });
    });

    /**
     * @api {post} /breweries Add single
     * @apiName PostBrewery
     * @apiGroup Breweries
     * @apiVersion 0.1.0
     * @apiUse BreweryPostParameters
     */
    server.post({
        url: '/breweries',
        validation: {
            content: {
                //required parameters
                name: { isRequired: true },
                address1: { isRequired: true },
                city: { isRequired: true, isAlphanumeric: true },
                country: { isRequired: true, isAlphanumeric: true },

                //optional parameters
                address2: { isRequired: false, isAlphanumeric: true },
                state: { isRequired: false, isAlphanumeric: true },
                code: { isRequired: false, isAlphanumeric: true },
                phone: { isRequired: false, isAlphanumeric: true },
                website: { isRequired: false, isAlphanumeric: true },
                descript: { isRequired: false, isAlphanumeric: true }
            }
        }
    }, function (req, res, next) {

        //enable jwt authentication for this endpoint
        passport.authenticate('jwt', { session: false }, function (info, user, err) {
            if (err) return next(err);

            //check if user attempts to edit his own data
            if (!['admin', 'contributor'].includes(user.role)) {
                res.send(401, "Insufficient Permissions");
                return next();
            }

            _models2.default.Brewery.build(req.body).save().then(function (newBrewery) {
                res.send(newBrewery);
            }).catch(function (err) {
                return next(err);
            });
        })(req, res, next);
    });

    /**
     * @api {get} /breweries/:id Get single
     * @apiName GetBreweryId
     * @apiGroup Breweries
     * @apiVersion 0.1.0
     * @apiSuccess {Object} Brewery Brewery response object
     * @apiUse BreweryResponseFields
     */
    server.get({
        url: '/breweries/:id',
        validation: {
            resources: {
                id: { isRequired: true, isNumeric: true }
            },
            queries: {
                fields: { isRequired: false, regex: /^(([a-zA-Z0-9\-_],*)+|\*)$/, descriprion: "Fields to include in response (comma separated)" },
                recursive: { isRequired: false, isBoolean: true }
            }
        }
    }, function (req, res, next) {

        var query = new _RequestBuilder2.default(req, _models2.default, 'Brewery', {
            where: { id: req.params.id },
            include: [_models2.default.BreweryGeocode, {
                model: _models2.default.Beer, attributes: ['id', 'name']
            }]
        }).enableFieldsSelection().enableRecursivity().finalize();

        _models2.default.Brewery.findOne(query).then(function (brewery) {
            if (!brewery) {
                res.send(new _restify2.default.NotFoundError("Brewery was not found"));
            } else {
                res.send(brewery.get({ plain: true }));
            }
            return next();
        }).catch(function (err) {
            return next(err);
        });
    });

    /**
     * @api {put} /breweries Update single
     * @apiName PutBrewery
     * @apiGroup Breweries
     * @apiVersion 0.1.0
     * @apiUse BreweryPutParameters
     */
    server.put({
        url: '/breweries/:id',
        validation: {
            resources: {
                id: { isRequired: true, isNumeric: true }
            },
            content: {
                name: { isRequired: false },
                address1: { isRequired: false, isAlphanumeric: true },
                city: { isRequired: false, isAlphanumeric: true },
                country: { isRequired: false, isAlphanumeric: true },
                address2: { isRequired: false, isAlphanumeric: true },
                state: { isRequired: false, isAlphanumeric: true },
                code: { isRequired: false, isAlphanumeric: true },
                phone: { isRequired: false, isAlphanumeric: true },
                website: { isRequired: false, isAlphanumeric: true },
                descript: { isRequired: false, isAlphanumeric: true }
            }
        }
    }, function (req, res, next) {

        //enable jwt authentication for this endpoint
        passport.authenticate('jwt', { session: false }, function (info, user, err) {
            if (err) return next(err);

            //check if user attempts to edit his own data
            if (!['admin', 'contributor'].includes(user.role)) {
                res.send(401, "Insufficient Permissions");
                return next();
            }

            _models2.default.Brewery.findOne({
                where: {
                    id: req.params.id
                }
            }).then(function (brewery) {
                if (!brewery) {
                    res.send(new _restify2.default.NotFoundError("Requested Brewery was not found"));
                } else {
                    brewery.update(req.params).then(function (updatedBrewery) {
                        res.send(updatedBrewery);
                    }).catch(function (err) {
                        return next(err);
                    });
                }
            }).catch(function (err) {
                return next(err);
            });
        })(req, res, next);
    });
}