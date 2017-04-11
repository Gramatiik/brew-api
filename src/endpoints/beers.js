import db from "../models";
import RequestBuilder from "../helpers/RequestBuilder";
import restify from "restify";

export default function beersEndpoints(server, passport) {

    /**
     * @api {get} /beers/count Get count
     * @apiName GetBeersCount
     * @apiGroup Beers
     * @apiVersion 1.0.0
     * @apiSuccess {Number} count number of beers
     * @apiDescription Get the total number of beers in database.
     * @apiPermission none
     */
    server.get('/beers/count', (req, res, next) => {
        db.Beer.count().then( (count) => {
            res.send({count: count});
            return next();
        }).catch( (err) => {
            return next(err);
        });
    });

    /**
     * @api {get} /beers Get list
     * @apiName GetBeers
     * @apiGroup Beers
     * @apiVersion 1.0.0
     * @apiSuccess {Object[]} Beer list of beer response objects
     * @apiUse BeerResponseFields
     * @apiDescription Get a list of beers, use filtering and ordering to query precisely.
     * @apiPermission none
     */
    server.get({
        url: '/beers',
        validation: {
            queries: {
                fields:             { isRequired: false, regex: /^(([a-zA-Z0-9\-_],*)+|\*)$/, description: "Fields to include in response (comma separated)"},
                recursive:          { isRequired: false, regex: /^(true|false)$/},
                limit:              { isRequired: false, isNumeric: true },
                offset:             { isRequired: false, isNumeric: true },
                order:              { isRequired: false, regex: /(^\w+:\w+$)/, description: "<field>:<ordering>"}
            }
        }
    }, (req, res, next) => {

        let query = new RequestBuilder(req, db, 'Beer', {
            include: [db.Category, db.Style],
            defaultLimit: 25,
            maxLimit: 75
        })  .enableFieldsSelection()
            .enableRecursivity()
            .enablePagination()
            .enableOrdering()
            .finalize();

        db.Beer.findAll(query).then( (breweries) => {
            if (!breweries) {
                res.send(new restify.NotFoundError("No beers were found..."));
            } else {
                res.send(breweries);
            }
            return next();
        }).catch((err) => {
            return next(err);
        });

    });

    /**
     * @api {get} /beers/search/:query Search list
     * @apiName GetSearchBeers
     * @apiGroup Beers
     * @apiVersion 1.0.0
     * @apiSuccess {Object} Beer Beer response object
     * @apiUse BeerResponseFields
     * @apiDescription Search for a beer, you can use ordering and pagination here.
     * @apiPermission none
     */
    server.get({
            url: '/beers/search/:query',
            validation: {
                resources: {
                    query:  { isRequired: true }
                }
            }
        },

        (req, res, next) => {

            let query = new RequestBuilder(req, db, 'Beer', {
                include: [db.Category, db.Style],
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

            db.Beer.findAll(query).then( (beers) => {
                if (!beers) {
                    res.send(new restify.NotFoundError("No beers were found..."));
                } else {
                    res.send(beers);
                }
                return next();
            }).catch((err) => {
                return next(err);
            });
        });

    /**
     * @api {get} /beers/:id Get single
     * @apiName GetBeer
     * @apiGroup Beers
     * @apiVersion 1.0.0
     * @apiSuccess {Object} Beer Beer response object
     * @apiUse BeerResponseFields
     * @apiDescription Get a Beer by its ID in database.
     * @apiPermission none
     */
    server.get({
        url: '/beers/:id',
        validation: {
            resources: {
                id:                 { isRequired: true, isNumeric: true }
            }
        }
    },

        (req, res, next) => {

            let query = new RequestBuilder(req, db, 'Beer', {
                include: [db.Brewery, db.Category, db.Style],
                where: {
                    id: req.params.id
                }
            })  .enableFieldsSelection()
                .enableRecursivity()
                .finalize();

            db.Beer.findOne(query).then( (beer) => {
                if(!beer) {
                    let error = new restify.NotFoundError("Requested beer was not found");
                    console.log(error);
                    res.send(error);
                } else {
                    res.send(beer.get({plain: true}));
                }
                return next();
            }).catch( (err) => {
                return next(err);
            });
    });

    /**
     * @api {delete} /beers/:id Delete single
     * @apiName DeleteBeer
     * @apiGroup Beers
     * @apiVersion 1.0.0
     * @apiUse BeerResponseFields
     * @apiDescription Delete a Beer by its ID in database.
     * @apiPermission admin
     */
    server.del({
            url: '/beers/:id',
            validation: {
                resources: {
                    id:                 { isRequired: true, isNumeric: true }
                }
            }
        },

        (req, res, next) => {

            //enable jwt authentication for this endpoint
            passport.authenticate('jwt', { session: false }, (info, user, err) => {
                if(err) return next(err);

                //check if user group if authorized to access this endpoint
                if(!['admin'].includes(user.role)) {
                    res.send(401, "Insufficient Permissions");
                    return next();
                }

                db.Beer.destroy({
                    where: {
                        id: req.params.id
                    }
                }).then( (beer) => {
                    if(!beer) {
                        let error = new restify.NotFoundError("Unable to delete this beer...");
                        res.send(error);
                    } else {
                        res.send({
                            status: "OK",
                            message: "Successfully deleted this beer !"
                        });
                    }
                    return next();
                }).catch( (err) => {
                    return next(err);
                });

            })(req, res, next);
        });

    /**
     * @api {post} /beers/:id Add single
     * @apiName PostBeer
     * @apiGroup Beers
     * @apiVersion 1.0.0
     * @apiSuccess {Object} Beer Beer response object
     * @apiuse BeerPostParameters
     * @apiuse BeerResponseFields
     * @apiDescription Add a new Beer to the database
     *
     * returns the added object if it succeded.
     * @apiPermission admin contributor
     */
    server.post({
            url: '/beers',
            validation: {
                content: {
                    //required parameters
                    name:           { isRequired: true },
                    abv:            { isRequired: true, isNumeric: true },

                    //optional parameters
                    brewery_id:     { isRequired: false, isNumeric: true },
                    cat_id:         { isRequired: false, isNumeric: true },
                    style_id:       { isRequired: false, isNumeric: true },
                    ibu:            { isRequired: false, isNumeric: true },
                    srm:            { isRequired: false, isNumeric: true },
                    upc:            { isRequired: false, isNumeric: true },
                    descript:       { isRequired: false }
                }
            }
        },

        (req, res, next) => {

            //enable jwt authentication for this endpoint
            passport.authenticate('jwt', { session: false }, (info, user, err) => {
                if(err) return next(err);

                //check if user group if authorized to access this endpoint
                if(!['admin', 'contributor'].includes(user.role)) {
                    res.send(401, "Insufficient Permissions");
                    return next();
                }

                db.Beer.build(req.body)
                    .save()
                    .then( (newBeer) => {
                        res.send(newBeer);
                        return next();
                    }).catch( (err) => {
                    return next(err);
                });

            })(req, res, next);
        });

    /**
     * @api {put} /beers/:id Update single
     * @apiName PutBeer
     * @apiGroup Beers
     * @apiVersion 1.0.0
     * @apiSuccess {Object} Beer Beer response object
     * @apiuse BeerPutParameters
     * @apiuse BeerResponseFields
     * @apiDescription Update a Beer fields by its ID,
     *
     * returns the modified Beer in case of success.
     * @apiPermission admin contributor
     */
    server.put({
            url: '/beers/:id',
            validation: {
                resources: {
                    id:             { isRequired: true, isNumeric: true }
                },
                content: {
                    brewery_id:     { isRequired: false, isNumeric: true },
                    name:           { isRequired: false },
                    cat_id:         { isRequired: false, isNumeric: true },
                    style_id:       { isRequired: false, isNumeric: true },
                    abv:            { isRequired: false, isNumeric: true },
                    ibu:            { isRequired: false, isNumeric: true },
                    srm:            { isRequired: false, isNumeric: true },
                    upc:            { isRequired: false, isNumeric: true },
                    descript:       { isRequired: false }
                }
            }
        },

        (req, res, next) => {

            //enable jwt authentication for this endpoint
            passport.authenticate('jwt', { session: false }, (info, user, err) => {
                if(err) return next(err);

                //check if user group if authorized to access this endpoint
                if(!['admin', 'contributor'].includes(user.role)) {
                    res.send(401, "Insufficient Permissions");
                    return next();
                }

                db.Beer.findOne({
                    where: {
                        id: req.params.id
                    },
                    include: [db.Brewery, db.Category, db.Style]
                }).then( (beer) => {
                    if(!beer) {
                        res.send(new restify.NotFoundError("Requested beer was not found"));
                    } else {
                        beer.update(req.params).
                        then( (updatedBeer) => {
                            res.send(updatedBeer);
                        }).catch( (err) => {
                            return next(err);
                        });
                    }
                    return next();
                }).catch( (err) => {
                    return next(err);
                });

            })(req, res, next);
        });

}
