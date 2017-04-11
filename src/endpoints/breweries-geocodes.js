import db from "../models";
import restify from "restify";
import RequestBuilder from "../helpers/RequestBuilder";
import GooglePlacesConnector from '../connectors/GooglePlacesConnector';

export default function breweriesGeocodesEndpoints(server, passport) {

    /**
     * @api {get} /breweries-locations/count Get count
     * @apiName GetBreweriesLocationsCount
     * @apiGroup BreweriesLocations
     * @apiVersion 1.0.0
     * @apiSuccess {Number} count number of breweries-locations
     * @apiPermission none
     * @apiDescription Get the total number of breweries-locations in database
     */
    server.get('/breweries-locations/count', (req, res, next) => {
        db.BreweryGeocode.count().then( function(count) {
            console.log(count);
            res.send({count: count});
            return next();
        }).catch( (err) => {
            return next(err);
        });
    });

    /**
     * @api {get} /breweries-locations/near Get near breweries
     * @apiName GetBreweriesLocationsNear
     * @apiGroup BreweriesLocations
     * @apiVersion 1.0.0
     * @apiParam {Number} latitude Center latitude
     * @apiParam {Number} longitude Center longitude
     * @apiParam {Number} distance Radius from center point (in KM)
     * @apiParam {boolean} [bars] Should include bars around breweries or not
     *
     * @apiSuccess {Object[]} BreweryGeocode
     * @apiSuccess {Number}     BreweryGeocode.id id of this location item
     * @apiSuccess {Number}     BreweryGeocode.brewery_id brewery id for this location
     * @apiSuccess {Number}     BreweryGeocode.latitude latitude value
     * @apiSuccess {Number}     BreweryGeocode.longitude longitude value
     * @apiSuccess {String}     BreweryGeocode.accuracy type of accuracy for the measurement
     * @apiPermission none
     * @apiDescription Get the nearest breweries-locations withing a radius of distance (in km) at given GPS coordinates (includes brewery name).
     */
    server.get({
        url: '/breweries-locations/near',
        validation: {
            queries: {
                latitude: { isRequired: true, isFloat: true },
                longitude: { isRequired: true, isFloat: true },
                distance: { isRequired: true, isNumeric: true },
                bars: { isRequired: false, isBoolean: true }
            }
        }
        }, (req, res, next) => {
        db.sequelize.query(`SELECT breweries_geocode.*, breweries.name, ACOS(
        SIN(RADIANS(breweries_geocode.latitude)) * SIN(RADIANS(:lat)) +
        COS(RADIANS(breweries_geocode.latitude)) * COS(RADIANS(:lat)) *
        COS(RADIANS(breweries_geocode.longitude) - RADIANS(:lng))
        ) * 6371 AS distance
        FROM breweries_geocode
        LEFT JOIN breweries ON breweries_geocode.brewery_id = breweries.id
        WHERE ACOS(
        SIN(RADIANS(breweries_geocode.latitude)) * SIN(RADIANS(:lat)) +
        COS(RADIANS(breweries_geocode.latitude)) * COS(RADIANS(:lat)) *
        COS(RADIANS(:lng) - RADIANS(breweries_geocode.longitude))
        ) * 6371 <= :dist
        ORDER BY distance ASC
        LIMIT 200`,
            {
                replacements: {
                    lat: parseFloat(req.params.latitude),
                    lng: parseFloat(req.params.longitude),
                    dist: parseInt(req.params.distance),
                },
                type: db.sequelize.QueryTypes.SELECT
            }
        ).then( function(locations) {
            if(!locations){
                return next(new restify.NotFoundError("No breweries locations found with the given parameters"));
            } else {

                //if we choosed to search for bars
                if(req.params.bars && req.params.bars === 'true' ) {
                    //we loop through locations and attempt to find bars
                    let promises = [];
                    for(let loc of locations) {
                        promises.push(GooglePlacesConnector.searchNearBars(loc.latitude, loc.longitude, 1000).then( (bars) => {
                            loc.bars = JSON.parse(bars).results || {};
                        }));
                    }

                    //wait for Places API response and add data to response
                    Promise.all(promises).then( () => {
                        res.send(locations);
                        return next();
                    });
                } else {
                    res.send(locations);
                    return next();
                }
            }
        }).catch( (err) => {
            return next(err);
        });
    });

    /**
     * @api {get} /breweries-locations Get list
     * @apiName GetBreweriesLocations
     * @apiGroup BreweriesLocations
     * @apiVersion 1.0.0
     *
     * @apiSuccess {Object[]} BreweryGeocode
     * @apiSuccess {Number}     BreweryGeocode.id id of this location item
     * @apiSuccess {Number}     BreweryGeocode.brewery_id brewery id for this location
     * @apiSuccess {Number}     BreweryGeocode.latitude latitude value
     * @apiSuccess {Number}     BreweryGeocode.longitude longitude value
     * @apiSuccess {String}     BreweryGeocode.accuracy type of accuracy for the measurement
     * @apiPermission none
     * @apiDescription Get a list of Breweries, you can use ordering and pagination here.
     */
    server.get({
            url: '/breweries-locations',
            validation: {
                queries: {
                    fields: { isRequired: false, regex: /^(([a-zA-Z0-9\-_],*)+|\*)$/, description: "Fields to include in response (comma separated)"},
                    recursive: { isRequired: false, regex: /^(true|false)$/},
                    limit: { isRequired: false, isNumeric: true },
                    offset: { isRequired: false, isNumeric: true },
                    order: { isRequired: false, regex: /(^\w+:\w+$)/, description: "<field>:<ordering>"}
                }
            }
        },
        function(req, res, next) {

            let query = new RequestBuilder(req, db, 'BreweryGeolocation', {
                defaultLimit: 50,
                maxLimit: 100
            })
                //tweak options for this endpoint
                .enableFieldsSelection()
                .enableOrdering()
                .enablePagination()
                .finalize();

            db.BreweryGeocode.findAll(query).then( (breweryGeocodes) => {
                if(!breweryGeocodes){
                    res.send(new restify.NotFoundError("No Breweries Locations were found..."));
                } else {
                    res.send(breweryGeocodes);
                }
                return next();
            }).catch( (err) => {
                return next(err);
            });
        });

    /**
     * @api {get} /breweries-locations/:brewery_id Get single
     * @apiName GetBreweriesLocationsId
     * @apiGroup BreweriesLocations
     * @apiVersion 1.0.0
     *
     * @apiParam {boolean} [bars] Set to true if you want to find close bars
     *
     * @apiSuccess {Object} BreweryGeocode
     * @apiSuccess {Number}     BreweryGeocode.id id of this location item
     * @apiSuccess {Number}     BreweryGeocode.brewery_id brewery id for this location
     * @apiSuccess {Number}     BreweryGeocode.latitude latitude value
     * @apiSuccess {Number}     BreweryGeocode.longitude longitude value
     * @apiSuccess {String}     BreweryGeocode.accuracy type of accuracy for the measurement
     * @apiPermission none
     * @apiDescription Get a single Brewery Location record.
     */
    server.get({
            url: '/breweries-locations/:breweryId',
            validation: {
                resources: {
                    breweryId: { isRequired: true, isNumeric: true }
                },
                queries: {
                    bars: { isRequired: false, isBoolean: true }
                }
            }
        },
        function(req, res, next) {
            let query = new RequestBuilder(req, db, 'BreweryGeolocation', {
                where: {
                    brewery_id: req.params.breweryId
                }
            })
                //tweak options for this endpoint
                .enableFieldsSelection()
                .finalize();

            db.BreweryGeocode.findOne(query).then( (breweryGeocode) => {
                if(!breweryGeocode){
                    res.send(new restify.NotFoundError("Geolocation for brewery was not found"));
                } else {
                    if(req.params.bars && req.params.bars === 'true') {
                        GooglePlacesConnector.searchNearBars(breweryGeocode.latitude, breweryGeocode.longitude, 1000).then( (bars) => {

                            let responseObject = breweryGeocode.get({plain: true});
                            responseObject.bars = JSON.parse(bars).results || {};
                            res.send(responseObject);
                            return next();

                        });
                    } else {
                        res.send(breweryGeocode.get({plain: true}));
                        return next();
                    }
                }
                return next();
            }).catch( (err) => {
                return next(err);
            });

        });


    /**
     * @api {post} /breweries-locations Add single
     * @apiName PostBreweriesLocation
     * @apiGroup BreweriesLocations
     * @apiVersion 1.0.0
     *
     * @apiSuccess {Object} BreweryGeocode
     * @apiSuccess {Number}     BreweryGeocode.id id of this location item
     * @apiSuccess {Number}     BreweryGeocode.brewery_id brewery id for this location
     * @apiSuccess {Number}     BreweryGeocode.latitude latitude value
     * @apiSuccess {Number}     BreweryGeocode.longitude longitude value
     * @apiSuccess {String}     BreweryGeocode.accuracy type of accuracy for the measurement
     * @apiPermission admin contributor
     * @apiDescription Add a new Brewery Location to database.
     */
    server.post({
            url: '/breweries-locations',
            validation: {
                content: {
                    //required parameters
                    brewery_id: { isRequired: true, isNumeric: true },
                    latitude: { isRequired: true, isNumeric: true },
                    longitude: { isRequired: true, isNumeric: true },

                    //optional parameters
                    accuracy:   { isRequired: false }
                }
            }
        },
        function(req, res, next) {

            //enable jwt authentication for this endpoint
            passport.authenticate('jwt', { session: false }, (info, user, err) => {
                if(err) return next(err);

                //check if user attempts to edit his own data
                if(!['admin','contributor'].includes(user.role)) {
                    res.send(401, "Insufficient Permissions");
                    return next();
                }

                db.BreweryGeocode.build(req.body)
                    .save( (newBrewery) => {
                        res.send(newBrewery);
                        return next();
                    }).catch( (err) => {
                    return next(err);
                });

            })(req, res, next);
        });

    /**
     * @api {delete} /breweries-locations/:brewery_id Delete single
     * @apiName DeleteBreweriesLocation
     * @apiGroup BreweriesLocations
     * @apiVersion 1.0.0
     * @apiPermission admin
     * @apiDescription Delete a Brewery Location from database
     * (this does not delete associated brewery and does not update brewery_location_id field , use it with caution).
     */
    server.del({
            url: '/breweries-locations/:breweryId',
            validation: {
                resources: {
                    breweryId: { isRequired: true, isNumeric: true}
                }
            }
        },
        function(req, res, next) {

            //enable jwt authentication for this endpoint
            passport.authenticate('jwt', { session: false }, (info, user, err) => {
                if(err) return next(err);

                //check if user is authorised to do this
                if(!['admin'].includes(user.role)) {
                    res.send(401, "Insufficient Permissions");
                    return next();
                }

                db.BreweryGeocode.destroy({
                    where: {
                        brewery_id: req.params.breweryId
                    }
                }).then( (status) => {
                    if(!status) {
                        return next(new restify.NotFoundError("Unable to delete, requested Brewery Location was not found..."));
                    } else {
                        res.send({
                            status: "OK",
                            message: "Successfully deleted requested brewery-geocode"
                        });
                    }
                    return next();
                }).catch( (error) => {
                    return next(error);
                });

            })(req, res, next);
        });

    /**
     * @api {put} /breweries-locations/:brewery_id Update single
     * @apiName PutBreweriesLocation
     * @apiGroup BreweriesLocations
     * @apiVersion 1.0.0
     *
     * @apiSuccess {Object} BreweryGeocode
     * @apiSuccess {Number}     BreweryGeocode.id id of this location item
     * @apiSuccess {Number}     BreweryGeocode.brewery_id brewery id for this location
     * @apiSuccess {Number}     BreweryGeocode.latitude latitude value
     * @apiSuccess {Number}     BreweryGeocode.longitude longitude value
     * @apiSuccess {String}     BreweryGeocode.accuracy type of accuracy for the measurement
     * @apiPermission admin, contributor
     * @apiDescription Update a Brewery Location in database.
     */
    server.put({
            url: '/breweries-locations/:breweryId',
            validation: {
                resources: {
                    breweryId: { isRequired: true, isNumeric: true}
                },
                content: {
                    brewery_id: { isRequired: false, isNumeric: true },
                    latitude: { isRequired: false, isNumeric: true },
                    longitude: { isRequired: false, isNumeric: true },
                    accuracy:   { isRequired: false }
                }
            }
        },
        function(req, res, next) {

            //enable jwt authentication for this endpoint
            passport.authenticate('jwt', { session: false }, (info, user, err) => {
                if(err) return next(err);

                //check if user is authorised to do this
                if(!['admin','contributor'].includes(user.role)) {
                    res.send(401, "Insufficient Permissions");
                    return next();
                }

                db.BreweryGeocode.findOne({
                    where: {
                        brewery_id: req.params.breweryId
                    }
                }).then( (breweryLocation) => {
                    if(!breweryLocation) {
                        return next(new restify.NotFoundError("Requested Brewery Location was not found"));
                    } else {
                        breweryLocation.update(req.body)
                            .then((newBrewery) => {
                                res.send(newBrewery);
                                return next();
                            }).catch( (err) => {
                            return next(err);
                        });
                    }
                });

            })(req, res, next);
        });

}
