import db from "../models";
import restify from "restify";
import RequestBuilder from "../helpers/RequestBuilder";

export default function breweriesGeocodesEndpoints(server, passport) {

    /**
     * @api {get} /breweries-locationd/count Get count
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
                resources: {
                    brewery_id: { isRequired: true, isNumeric: true }
                }
            }
        },
        function(req, res, next) {
            if(req.params.id && req.params.id)
                db.BreweryGeocode.findOne({
                    where: {
                        brewery_id: req.params.brewery_id
                    }
                }).then( (breweryGeocode) => {
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

            if(req.params.breweryId && req.params.breweryId)
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
}
