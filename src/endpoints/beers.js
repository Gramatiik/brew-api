import db from "../models";
import restify from "restify";
import passport from "passport";
import passportlHttp from "passport-http";
const BasicStrategy = passportlHttp.BasicStrategy;

passport.use(new BasicStrategy(
    function(username, password, done) {
        db.User.findOne({
            where: {
                username: username
            }
        }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

export default function beersEndpoints(server) {
    server.get({
        url: '/beers/:id',
        validation: {
            resources: {
                id: { isRequired: true, isNumeric: true }
            }
        }
    },
        //passport.authenticate('basic', { session: false }),
        function(req, res, next) {
        if(req.params.id && req.params.id)
            db.Beer.findOne({
                where: {
                    id: req.params.id
                }
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