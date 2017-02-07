import db from "../models";

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
        if(req.params.id && req.params.id)
            db.Brewery.findOne({
                where: {
                    id: req.params.id
                },
                include: [ db.BreweryGeocode ]
            }).then( (brewery) => {
                if(!brewery){
                    res.send(new restify.NotFoundError("Brewery was not found"));
                } else {
                    res.send(brewery.get({plain: true}));
                }
                return next();
            }).catch( (err) => {
                return next(err);
            });
    });
}