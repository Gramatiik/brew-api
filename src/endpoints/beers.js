import db from "../models";
import RequestBuilder from "../helpers/RequestBuilder";
import restify from "restify";

export default function beersEndpoints(server, passport) {

    /**
     * @api {get} /beers/count Get count
     * @apiName GetBeersCount
     * @apiGroup Beers
     * @apiVersion 0.1.0
     * @apiSuccess {Number} count number of beers
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
     * @apiVersion 0.1.0
     * @apiSuccess {Object[]} Beer list of beer response objects
     * @apiUse BeerResponseFields
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
            include: [db.BreweryGeocode, db.Beer ],
            defaultLimit: 10,
            maxLimit: 50
        })  .enableFieldsSelection()
            .enableRecursivity()
            .enablePagination()
            .enableOrdering()
            .finalize();

        db.Brewery.findAll(query).then( (breweries) => {
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
                id:                 { isRequired: true, isNumeric: true }
            }
        }
    },

        (req, res, next) => {
            db.Beer.findOne({
                where: {
                    id: req.params.id
                },
                include: [db.Brewery, db.Category, db.Style]
            }).then( (beer) => {
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
                    name:           { isRequired: true },

                    //optional parameters
                    brewery_id:     { isRequired: false, isNumeric: true },
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
                req.user = user;
            })(req, res, next);

            //check if user group if authorized to access this endpoint
            if(!['admin', 'contributor'].includes(req.user.role)) {
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
        });
}
