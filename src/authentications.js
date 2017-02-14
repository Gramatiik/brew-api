import passportHttp from "passport-http";
const BasicStrategy = passportHttp.BasicStrategy;

/**
 * Define here all authentication methods available for the API
 * @example usage in endpoitn file : "passport.authenticate('basic', { session: false })"
 * to use basic authentication on this specific endpoint, you cancahnge 'basic' for any other authentication
 * method that was loaded here
 * @param passport passport instance that will load anthentications
 * @param db database object
 */
export default function (passport, db) {

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
            })
        }
    ));
}