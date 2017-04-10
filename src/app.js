import restify from "restify";
import restifyValidation from "node-restify-validation";
import passport from "passport";
import db from "./models";

//error handling
import handlerErrors from "./errors/handleErrors";

//endpoints
import authEndpoints from "./endpoints/auth";
import usersEndpoints from "./endpoints/users";
import beersEndpoints from "./endpoints/beers";
import breweriesEndpoints from "./endpoints/breweries";
import breweriesGeocodeEndpoint from "./endpoints/breweries-geocodes";
import loadAuthentications from "./authentications";


//create restify server
let server = restify.createServer({
    name: 'brewAPI'
});

//initialize passport for protected endpoints
server.use(passport.initialize());

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

server.use( (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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

//define passport authentication strategy
loadAuthentications(passport, db);

//Setup users endpoint
usersEndpoints(server, passport);

//setup beers endpoints
beersEndpoints(server, passport);

//setup breweries endpoints
breweriesEndpoints(server, passport);

//setup breweries geocodes endpoints
breweriesGeocodeEndpoint(server, passport);

//authentication endpoint
authEndpoints(server);

//Catch errors
handlerErrors(server);

//launch server !
server.listen('80', () => {
    console.log('%s listening at %s', server.name, server.url);
});
