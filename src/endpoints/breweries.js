import db from "../models";
import RequestBuilder from "../helpers/RequestBuilder";
import restify from "restify";

export default function breweriesEndpoints(server, passport) {

    /**
     * @api {get} /breweries/count Get count
     * @apiName GetBreweriesCount
     * @apiGroup Breweries
     * @apiVersion 1.0.0
     * @apiSuccess {Number} count number of breweries
     * @apiPermission none
     * @apiDescription Get the total number of Breweries in database.
     */
    server.get('/breweries/count', (req, res, next) => {
        db.Brewery.count().then( function(count) {
            console.log(count);
            res.send({count: count});
            return next();
        }).catch( (err) => {
            return next(err);
        });
    });

    /**
     * @api {get} /breweries Get list
     * @apiName GetBrewery
     * @apiGroup Breweries
     * @apiVersion 1.0.0
     * @apiSuccess {Object[]} Brewery Brewery response object
     * @apiUse BreweryResponseFields
     * @apiPermission none
     * @apiDescription Get a list of breweries, you can use ordering and pagination here.
     */
    server.get({
        url: '/breweries',
        validation: {
            queries: {
                fields: { isRequired: false, regex: /^(([a-zA-Z0-9\-_],*)+|\*)$/, description: "Fields to include in response (comma separated)"},
                recursive: { isRequired: false, regex: /^(true|false)$/},
                limit: { isRequired: false, isNumeric: true },
                offset: { isRequired: false, isNumeric: true },
                order: { isRequired: false, regex: /(^\w+:\w+$)/, description: "<field>:<ordering>"}
            }
        }
    }, (req, res, next) => {

        let query = new RequestBuilder(req, db, 'Brewery', {
            include: [db.BreweryGeocode, db.Beer ],
            defaultLimit: 20,
            maxLimit: 50
        })  .enableFieldsSelection()
            .enableRecursivity()
            .enablePagination()
            .enableOrdering()
            .finalize();

        db.Brewery.findAll(query).then( (breweries) => {
            if (!breweries) {
                res.send(new restify.NotFoundError("No breweries were found..."));
            } else {
                res.send(breweries);
            }
            return next();
        }).catch((err) => {
            return next(err);
        });

    });

    /**
     * @api {get} /breweries/search/:query Search list
     * @apiName GetSearchBreweries
     * @apiGroup Breweries
     * @apiVersion 1.0.0
     * @apiParam {String} query Search query
     * @apiSuccess {Object[]} Brewery Brewery response object
     * @apiUse BreweryResponseFields
     * @apiPermission none
     * @apiDescription Search for breweries by their names.
     */
    server.get({
            url: '/breweries/search/:query',
            validation: {
                resources: {
                    query:  { isRequired: true }
                }
            }
        },

        (req, res, next) => {

            let query = new RequestBuilder(req, db, 'Brewery', {
                include: [db.BreweryGeocode, db.Beer],
                where: {
                    name: {
                        $like: "%" + req.params.query + "%"
                    }
                }
            })  .enableFieldsSelection()
                .enableOrdering()
                .enablePagination()
                .enableRecursivity()
                .finalize();

            db.Brewery.findAll(query).then( (breweries) => {
                if (!breweries) {
                    res.send(new restify.NotFoundError("No breweries were found..."));
                } else {
                    res.send(breweries);
                }
                return next();
            }).catch((err) => {
                return next(err);
            });
        });

    /**
     * @api {post} /breweries Add single
     * @apiName PostBrewery
     * @apiGroup Breweries
     * @apiVersion 1.0.0
     * @apiUse BreweryPostParameters
     * @apiPermission admin contributor
     * @apiDescription Add a new Brewery to database.
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
                descript: { isRequired: false, isAlphanumeric: true },
            }
        }
    },
        (req, res, next) => {

            //enable jwt authentication for this endpoint
            passport.authenticate('jwt', { session: false }, (info, user, err) => {
                if(err) return next(err);

                //check if user attempts to edit his own data
                if(!['admin','contributor'].includes(user.role)) {
                    res.send(401, "Insufficient Permissions");
                    return next();
                }

                db.Brewery.build(req.body)
                    .save()
                    .then( (newBrewery) => {
                        res.send(newBrewery);
                    }).catch( (err) => {
                    return next(err);
                });

            })(req, res, next);
        });

    /**
     * @api {get} /breweries/:id Get single
     * @apiName GetBreweryId
     * @apiGroup Breweries
     * @apiVersion 1.0.0
     * @apiSuccess {Object} Brewery Brewery response object
     * @apiUse BreweryResponseFields
     * @apiPermission none
     * @apiDescription Get a single Brewery from database
     */
    server.get({
        url: '/breweries/:id',
        validation: {
            resources: {
                id: { isRequired: true, isNumeric: true }
            },
            queries: {
                fields: { isRequired: false, regex: /^(([a-zA-Z0-9\-_],*)+|\*)$/, descriprion: "Fields to include in response (comma separated)"},
                recursive: { isRequired: false, isBoolean: true }
            }
        }
    }, (req, res, next) => {

        let query = new RequestBuilder(req, db, 'Brewery', {
            where: {id: req.params.id},
            include: [db.BreweryGeocode, {
                model: db.Beer, attributes: ['id', 'name']
            }],
        })  .enableFieldsSelection()
            .enableRecursivity()
            .finalize();

        db.Brewery.findOne(query).then( (brewery) => {
            if (!brewery) {
                res.send(new restify.NotFoundError("Brewery was not found"));
            } else {
                res.send(brewery.get({plain: true}));
            }
            return next();
        }).catch((err) => {
            return next(err);
        });

    });

    /**
     * @api {delete} /breweries/:id Delete single
     * @apiName DeleteBreweryId
     * @apiGroup Breweries
     * @apiVersion 1.0.0
     * @apiUse BreweryResponseFields
     * @apiPermission admin
     * @apiDescription Delete a Brewery from database
     * (this does not delete location or beers related to this brewery and does not updates fields, use it with caution).
     */
    server.del({
        url: '/breweries/:id',
        validation: {
            resources: {
                id: { isRequired: true, isNumeric: true }
            },
            queries: {
                fields: { isRequired: false, regex: /^(([a-zA-Z0-9\-_],*)+|\*)$/, descriprion: "Fields to include in response (comma separated)"},
                recursive: { isRequired: false, isBoolean: true }
            }
        }
    }, (req, res, next) => {

        //enable jwt authentication for this endpoint
        passport.authenticate('jwt', { session: false }, (info, user, err) => {
            if(err) return next(err);

            //check if user attempts to edit his own data
            if(!['admin'].includes(user.role)) {
                res.send(401, "Insufficient Permissions");
                return next();
            }

            db.Brewery.destroy({
                where: {
                    id: req.params.id
                }
            }).then( (status) => {
                if(!status) {
                    res.send(new restify.NotFoundError("Unable to delete, requested Brewery was not found..."));
                } else {
                    res.send({
                        status: "OK",
                        message: "Successfully deleted requested beer"
                    })
                }
                return next();
            }).catch( (err) => {
                return next(err);
            });

        })(req, res, next);
    });

    /**
     * @api {put} /breweries Update single
     * @apiName PutBrewery
     * @apiGroup Breweries
     * @apiVersion 1.0.0
     * @apiUse BreweryPutParameters
     * @apiPermission admin contributor
     * @apiDescription Update a single Brewery in database.
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
                    descript: { isRequired: false, isAlphanumeric: true },
                }
            }
        },
        (req, res, next) => {

            //enable jwt authentication for this endpoint
            passport.authenticate('jwt', { session: false }, (info, user, err) => {
                if(err) return next(err);

                //check if user attempts to edit his own data
                if(!['admin','contributor'].includes(user.role)) {
                    res.send(401, "Insufficient Permissions");
                    return next();
                }

                db.Brewery.findOne({
                    where: {
                        id: req.params.id
                    }
                }).then( (brewery) => {
                    if(!brewery) {
                        res.send(new restify.NotFoundError("Requested Brewery was not found"));
                    } else {
                        brewery.update(req.params).
                        then( (updatedBrewery) => {
                            res.send(updatedBrewery);
                            return next();
                        }).catch( (err) => {
                            return next(err);
                        })
                    }
                }).catch( (err) => {
                    return next(err);
                });

            })(req, res, next);
        });

}
