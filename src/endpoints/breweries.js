import db from "../models";
import requestBuilder from "../helpers/requestBuilder";

export default function breweriesEndpoints(server) {
    server.get({
        url: '/breweries/:id',
        validation: {
            resources: {
                id: { isRequired: true, isNumeric: true }
            }
        }
    },
        function(req, res, next) {
        if(req.params.id && req.params.id) {
            let query = requestBuilder(req, db, {include: [db.BreweryGeocode, {model: db.Beer, attributes: ['id', 'name']}] });
            db.Brewery.findOne(query).then((brewery) => {
                if (!brewery) {
                    res.send(new restify.NotFoundError("Brewery was not found"));
                } else {
                    res.send(brewery.get({plain: true}));
                }
                return next();
            }).catch((err) => {
                return next(err);
            });
        }
    });
}