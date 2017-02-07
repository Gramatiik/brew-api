import db from "../models";
import restify from "restify";

export default function usersEndpoints(server) {
    server.use( (req, res, next) => {
        db.Brewery.hasOne(db.BreweryGeocode, { foreignKey: 'brewery_id'});
        return next();
    });

    server.get({
            url: '/users/:username',
            validation: {
                resources: {
                    username: { isRequired: true, isAlpha: true }
                }
            }
        },
        function(req, res, next) {
            if(req.params.username)
                db.User.findOne({
                    where: {
                        username: req.params.username
                    }
                }).then( (user) => {
                    if(!user) {
                        res.send(new restify.NotFoundError("Requested user was not found"));
                    } else {
                        res.send(user.get({plain: true}));
                    }
                    return next();
                }).catch( (err) => {
                    return next(err);
                });
        });
}