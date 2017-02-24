import db from "../models";
import RequestBuilder from "../helpers/RequestBuilder";
import restify from "restify";

export default function breweriesEndpoints(server, passport) {

    /**
     * @api {get} /breweries/count get the count of breweries
     * @apiName GetBreweriesCount
     * @apiGroup Breweries
     * @apiVersion 0.1.0
     * @apiSuccess {Number} count number of breweries
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
     * @api {post} /breweries add a new brewery
     * @apiName PostBrewery
     * @apiGroup Breweries
     * @apiVersion 0.1.0
     */
    server.post({
        url: '/breweries',
        validation: {
            content: {
                //required parameters
                name: { isRequired: true },
                address1: { isRequired: true, isAlphanumeric: true },
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
        passport.authenticate('jwt', { session: false }),
        (req, res, next) => {
            //TODO : save newly created brewery to database
            let newBrewery = db.Brewery.build(req.body);
            res.send(newBrewery);
            return next();
        });

    /**
     * @api {get} /breweries/:id get a brewery informations by id
     * @apiName GetBreweryId
     * @apiGroup Breweries
     * @apiVersion 0.1.0
     *
     * @apiSuccess {Object} Brewery Brewery response object
     * @apiSuccess {Number}     Brewery.id id of the record
     * @apiSuccess {Number}     Brewery.name Name of this brewery
     * @apiSuccess {Number}     Brewery.address1 First address line
     * @apiSuccess {Number}     Brewery.address2 Second address line
     * @apiSuccess {Number}     Brewery.city City
     * @apiSuccess {String}     Brewery.state State (if applicable)
     * @apiSuccess {String}     Brewery.code ZIP code
     * @apiSuccess {String}     Brewery.country Country
     * @apiSuccess {String}     Brewery.phone Phone
     * @apiSuccess {String}     Brewery.website Website
     * @apiSuccess {String}     Brewery.descript Description
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

}
