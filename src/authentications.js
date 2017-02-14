import passportHttp from "passport-http";
import passportJWT from "passport-jwt";
let jwt_config = require(__dirname + "/config/jwt-config.json");
const BasicStrategy = passportHttp.BasicStrategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

/**
 * Define here all authentication methods available for the API
 * @example usage in endpoitn file : "passport.authenticate('basic', { session: false })"
 * to use basic authentication on this specific endpoint, you cancahnge 'basic' for any other authentication
 * method that was loaded here
 * @param passport passport instance that will load anthentications
 * @param db database object
 */
export default function loadAuthentications(passport, db) {

    passport.use(new BasicStrategy( (username, password, done) => {
            db.User.findOne({
                where: {
                    username: username,
                    password: password
                }
            }).then( (user) => {
                return done(null, user);
            }).catch( (err) => {
                console.log(err);
                return done(null, false, { message: 'Invalid credentials.' });
            });
        }
    ));

    //make parameters for jwt authentication
    const params = {
        secretOrKey: jwt_config["jwt-secret"],
        jwtFromRequest: ExtractJwt.fromUrlQueryParameter("token")
    };

    passport.use( new JWTStrategy(params, (payload, done) => {
        console.log(payload);
            db.User.findOne({
                where: {
                    id: payload.id,
                }
            }).then( (user) => {
                return done(null, user);
            }).catch( (err) => {
                console.log(err);
                return done(null, false, { message: 'Invalid credentials.' });
            });
        }
    ));
}