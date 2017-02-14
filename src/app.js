import restify from "restify";
import restifyValidation from "node-restify-validation";
import passport from "passport";
import passportlHttp from "passport-http";
import db from "./models";
const BasicStrategy = passportlHttp.BasicStrategy;

import usersEndpoints from "./endpoints/users";
import beersEndpoints from "./endpoints/beers";
import breweriesEndpoints from "./endpoints/breweries";
import breweriesGeocodeEndpoint from "./endpoints/breweries-geocodes";


//create restify server
let server = restify.createServer({
    name: 'brewAPI'
});

//initialize passport for protected endpoints
server.use(passport.initialize());

//define passport authentication strategy
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

//setup validation engine
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.use(restifyValidation.validationPlugin( {
    // Shows errors as an array
    errorsAsArray: false,
    // Not exclude incoming variables not specified in validator rules
    forbidUndefinedVariables: false,
    errorHandler: restify.errors.InvalidArgumentError
}));

//set json content type for all API
server.use( (req, res, next) => {
    res.header('Content-Type', 'application/json');
    return next();
});

//default 'welcome' endpoint
server.get('/', (req,res, next) => {
    res.send({
        message: "Welcome to BrewAPI",
        version: "1.0.0"
    });

    return next();
});

//Setup TEST users endpoint
usersEndpoints(server);

//setup beers endpoints
beersEndpoints(server, passport);

//setup breweries endpoints
breweriesEndpoints(server);

//setup breweries geocodes endpoints
breweriesGeocodeEndpoint(server);

server.listen('9090', () => {
    console.log('%s listening at %s', server.name, server.url);
});