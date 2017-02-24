import db from "../models";
import RequestBuilder from "../helpers/RequestBuilder";
import restify from "restify";

export default function beersEndpoints(server, passport) {

    /**
     * @api {get} /beers/count number of beers
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
     * @api {get} /breweries get a list of breweries
     * @apiName GetBrewery
     * @apiGroup Breweries
     * @apiVersion 0.1.0
     * @apiSuccess {Object[]} Brewery Brewery response object
     * @apiSuccess {Number}     Brewery.id id of the record
     * @apiSuccess {String}     Brewery.name Name of this brewery
     * @apiSuccess {String}     Brewery.address1 First address line
     * @apiSuccess {String}     Brewery.address2 Second address line
     * @apiSuccess {String}     Brewery.city City
     * @apiSuccess {String}     Brewery.state State (if applicable)
     * @apiSuccess {String}     Brewery.code ZIP code
     * @apiSuccess {String}     Brewery.country Country
     * @apiSuccess {String}     Brewery.phone Phone
     * @apiSuccess {String}     Brewery.website Website
     * @apiSuccess {String}     Brewery.descript Description
     * @apiSuccess {Object}     Brewery.BreweryGeocode Geocode related object (if present)
     * @apiSuccess {Object[]}     Brewery.Beers Beers that belong to this brewery
     */
    server.get({
        url: '/beers',
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
     * @api {get} /breweries get a list of beers
     * @apiName GetBeers
     * @apiGroup Beers
     * @apiVersion 0.1.0
     * @apiSuccess {BeerObject[]} beers Array of beers
     */
    server.get({
        url: '/beers/:id',
        validation: {
            resources: {
                id: { isRequired: true, isNumeric: true }
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
}
