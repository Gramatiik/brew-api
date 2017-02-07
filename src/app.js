import restify from "restify";
import restifyValidation from "node-restify-validation";
import passport from "passport";

import beersEndpoints from "./endpoints/beers";
import breweriesEndpoints from "./endpoints/breweries";
import breweriesGeocodeEndpoint from "./endpoints/breweries-geocodes";

//create restify server
let server = restify.createServer({
    name: 'brewAPI'
});

//setup validation engine
server.use(restify.queryParser());
server.use(restify.bodyParser());


//initialize passport for protected endpoints
server.use(passport.initialize());

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

//setup beers endpoints
beersEndpoints(server);

//setup breweries endpoints
breweriesEndpoints(server);

//setup breweries geocodes endpoints
breweriesGeocodeEndpoint(server);

server.listen('9090', () => {
    console.log('%s listening at %s', server.name, server.url);
});