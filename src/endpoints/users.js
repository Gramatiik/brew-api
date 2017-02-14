import db from "../models";
import restify from "restify";

export default function usersEndpoints(server) {

    server.get({
            url: '/users/name/:username',
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
    server.get({
            url: '/users/:id',
            validation: {
                resources: {
                    id: { isRequired: true, isNumeric: true }
                }
            }
        },
        function(req, res, next) {
            db.User.findOne({
                where: {
                    id: req.params.id
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