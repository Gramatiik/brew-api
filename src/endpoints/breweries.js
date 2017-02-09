import db from "../models";
import RequestBuilder from "../helpers/RequestBuilder";

export default function breweriesEndpoints(server) {

    server.get('/breweries/count', (req, res, next) => {
        db.Brewery.count().then( function(count) {
            console.log(count);
            res.send({count: count});
            return next();
        }).catch( (err) => {
            return next(err);
        });
    });

    server.get({
        url: '/breweries/:id',
        validation: {
            resources: {
                id: { isRequired: true, isNumeric: true }
            },
            queries: {
                fields: { isRequired: false, regex: /^(([a-zA-Z0-9\-_],*)+|\*)$/, descriprion: "Fields to include in response (comma separated)"},
                recursive: { isRequired: false, isBoolean: true}
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

    server.get({
        url: '/breweries',
        validation: {
            queries: {
                fields: { isRequired: false, regex: /^(([a-zA-Z0-9\-_],*)+|\*)$/, descriprion: "Fields to include in response (comma separated)"},
                recursive: { isRequired: false, regex: /^(true|false)$/},
                limit: { isRequired: false, isNumeric: true },
                offset: { isRequired: false, isNumeric: true },
                order: { isRequired: false, regex: /(^\w+:\w+$)/, descriprion: "<field>:<ordering>"}
            }
        }
    }, (req, res, next) => {

        let query = new RequestBuilder(req, db, 'Brewery', {
            include: [db.BreweryGeocode, db.Beer ],
            defaultLimit: 20, //number of objects to fetch if no limit specified
            maxLimit: 50 //maximum number of objects to fetch if limit was specified in query
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

    server.post({
        url: '/breweries',
        validation: {
            content: {
                name: { isRequired: true },
                address1: { isRequired: true, isAlphanumeric: true },
                address2: { isRequired: false, isAlphanumeric: true },
                city: { isRequired: true, isAlphanumeric: true },
                state: { isRequired: false, isAlphanumeric: true },
                code: { isRequired: false, isAlphanumeric: true },
                country: { isRequired: true, isAlphanumeric: true },
                phone: { isRequired: false, isAlphanumeric: true },
                website: { isRequired: false, isAlphanumeric: true },
                descript: { isRequired: false, isAlphanumeric: true },
            }
        }
    }, (req, res, next) => {

        let newBrewery = db.Brewery.build(req.body);

        res.send(newBrewery)

        return next();
    });
}