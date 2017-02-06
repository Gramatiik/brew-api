import restify from "restify";
import restifyValidation from "node-restify-validation";
import passport from "passport";
import beersEndpoints from "./endpoints/beers";
import breweriesEndpoints from "./endpoints/breweries";
import db from "./models";

//create restify server
let server = restify.createServer({
    name: 'brewAPI'
});

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

server.use(passport.initialize());

//setup beers endpoints
beersEndpoints(server);

//setup breweries endpoints
breweriesEndpoints(server);

server.listen('9090', () => {
    console.log('%s listening at %s', server.name, server.url);
});