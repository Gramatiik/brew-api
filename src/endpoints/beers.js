import db from "../models";
import restify from "restify";

export default function beersEndpoints(server, passport) {

    server.get('/beers/count', (req, res, next) => {
        db.Beer.count().then( (count) => {
            res.send({count: count});
            return next();
        }).catch( (err) => {
            return next(err);
        });
    });

    server.get({
        url: '/beers/:id',
        validation: {
            resources: {
                id: { isRequired: true, isNumeric: true }
            }
        }
    },
        passport.authenticate('basic', { session: false }),
        function(req, res, next) {
        if(req.params.id && req.params.id)
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