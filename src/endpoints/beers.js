import db from "../models";
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
        passport.authenticate('jwt', { session: false }),
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
                    res.send(beer.get({plain: true}));
                }
                return next();
            }).catch( (err) => {
                return next(err);
            });
    });
}