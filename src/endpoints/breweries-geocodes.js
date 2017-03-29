import db from "../models";
import restify from "restify";
import RequestBuilder from "../helpers/RequestBuilder";

export default function breweriesGeocodesEndpoints(server, passport) {

    /**
     * @api {get} /breweries-locations/count Get count
     * @apiName GetBreweriesLocationsCount
     * @apiGroup BreweriesLocations
     * @apiVersion 0.1.0
     * @apiSuccess {Number} count number of breweries-locations
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
     * @apiVersion 0.1.0
     *
     * @apiSuccess {Object[]} BreweryGeocode
     * @apiSuccess {Number}     BreweryGeocode.id id of this location item
     * @apiSuccess {Number}     BreweryGeocode.brewery_id brewery id for this location
     * @apiSuccess {Number}     BreweryGeocode.latitude latitude value
     * @apiSuccess {Number}     BreweryGeocode.longitude longitude value
     * @apiSuccess {String}     BreweryGeocode.accuracy type of accuracy for the measurement
     */
    server.get({
        url: '/breweries-locations/near',
        validation: {
            queries: {
                latitude: { isRequired: true, isNumeric: true },
                longitude: { isRequired: true, isNumeric: true },
                distance: { isRequired: true, isNumeric: true },
            }
        }
        }, (req, res, next) => {
        db.sequelize.query(`SELECT *, DEGREES(ACOS(
        COS(RADIANS(latitude)) * COS(RADIANS(:lat)) *
        COS(RADIANS(longitude) - RADIANS(:lng)) +
        SIN(RADIANS(latitude)) * SIN(RADIANS(:lat))
        )) AS distance
        FROM breweries_geocode
        WHERE longitude BETWEEN :lng-:dist/abs(cos(:lat)*111) AND :lng+:dist/abs(cos(:lat)*111)
        AND latitude BETWEEN :lat-(:dist/111) AND :lat+(:dist/111)
        ORDER BY latitude DESC, longitude DESC
        LIMIT 10`,
            {
                replacements: {
                    lat: parseInt(req.params.latitude),
                    lng: parseInt(req.params.longitude),
                    dist: parseInt(req.params.distance),
                },
                type: db.sequelize.QueryTypes.SELECT
            }
        ).then( function(locations) {
            if(!locations){
                return next(new restify.NotFoundError("No breweries locations found with the given parameters"));
            } else {
                res.send(locations);
                return next();
            }
        }).catch( (err) => {
            return next(err);
        });
    });

    /**
     * @api {get} /breweries-locations Get list
     * @apiName GetBreweriesLocations
     * @apiGroup BreweriesLocations
     * @apiVersion 0.1.0
     *
     * @apiSuccess {Object[]} BreweryGeocode
     * @apiSuccess {Number}     BreweryGeocode.id id of this location item
     * @apiSuccess {Number}     BreweryGeocode.brewery_id brewery id for this location
     * @apiSuccess {Number}     BreweryGeocode.latitude latitude value
     * @apiSuccess {Number}     BreweryGeocode.longitude longitude value
     * @apiSuccess {String}     BreweryGeocode.accuracy type of accuracy for the measurement
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
     * @apiVersion 0.1.0
     *
     * @apiSuccess {Object} BreweryGeocode
     * @apiSuccess {Number}     BreweryGeocode.id id of this location item
     * @apiSuccess {Number}     BreweryGeocode.brewery_id brewery id for this location
     * @apiSuccess {Number}     BreweryGeocode.latitude latitude value
     * @apiSuccess {Number}     BreweryGeocode.longitude longitude value
     * @apiSuccess {String}     BreweryGeocode.accuracy type of accuracy for the measurement
     */
    server.get({
            url: '/breweries-locations/:breweryId',
            validation: {
                resources: {
                    breweryId: { isRequired: true, isNumeric: true }
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
                    res.send(breweryGeocode.get({plain: true}));
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
     * @apiVersion 0.1.0
     *
     * @apiSuccess {Object} BreweryGeocode
     * @apiSuccess {Number}     BreweryGeocode.id id of this location item
     * @apiSuccess {Number}     BreweryGeocode.brewery_id brewery id for this location
     * @apiSuccess {Number}     BreweryGeocode.latitude latitude value
     * @apiSuccess {Number}     BreweryGeocode.longitude longitude value
     * @apiSuccess {String}     BreweryGeocode.accuracy type of accuracy for the measurement
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
     * @api {put} /breweries-locations/:brewery_id Update single
     * @apiName PutBreweriesLocation
     * @apiGroup BreweriesLocations
     * @apiVersion 0.1.0
     *
     * @apiSuccess {Object} BreweryGeocode
     * @apiSuccess {Number}     BreweryGeocode.id id of this location item
     * @apiSuccess {Number}     BreweryGeocode.brewery_id brewery id for this location
     * @apiSuccess {Number}     BreweryGeocode.latitude latitude value
     * @apiSuccess {Number}     BreweryGeocode.longitude longitude value
     * @apiSuccess {String}     BreweryGeocode.accuracy type of accuracy for the measurement
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
