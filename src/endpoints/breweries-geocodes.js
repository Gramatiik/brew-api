import db from "../models";
import restify from "restify";

export default function breweriesGeocodesEndpoints(server) {
    server.get({
            url: '/breweries-geocodes/:id',
            validation: {
                resources: {
                    id: { isRequired: true, isNumeric: true }
                }
            }
        },
        function(req, res, next) {
            if(req.params.id && req.params.id)
                db.BreweryGeocode.findOne({
                    where: {
                        id: req.params.id
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
}