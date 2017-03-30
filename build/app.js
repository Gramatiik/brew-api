"use strict";

var _restify = require("restify");

var _restify2 = _interopRequireDefault(_restify);

var _nodeRestifyValidation = require("node-restify-validation");

var _nodeRestifyValidation2 = _interopRequireDefault(_nodeRestifyValidation);

var _passport = require("passport");

var _passport2 = _interopRequireDefault(_passport);

var _models = require("./models");

var _models2 = _interopRequireDefault(_models);

var _handleErrors = require("./errors/handleErrors");

var _handleErrors2 = _interopRequireDefault(_handleErrors);

var _auth = require("./endpoints/auth");

var _auth2 = _interopRequireDefault(_auth);

var _users = require("./endpoints/users");

var _users2 = _interopRequireDefault(_users);

var _beers = require("./endpoints/beers");

var _beers2 = _interopRequireDefault(_beers);

var _breweries = require("./endpoints/breweries");

var _breweries2 = _interopRequireDefault(_breweries);

var _breweriesGeocodes = require("./endpoints/breweries-geocodes");

var _breweriesGeocodes2 = _interopRequireDefault(_breweriesGeocodes);

var _authentications = require("./authentications");

var _authentications2 = _interopRequireDefault(_authentications);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//create restify server


//endpoints
var server = _restify2.default.createServer({
    name: 'brewAPI'
});

//initialize passport for protected endpoints


//error handling
server.use(_passport2.default.initialize());

//setup validation engine
server.use(_restify2.default.queryParser());
server.use(_restify2.default.bodyParser());

server.use(_nodeRestifyValidation2.default.validationPlugin({
    // Shows errors as an array
    errorsAsArray: false,
    // Not exclude incoming variables not specified in validator rules
    forbidUndefinedVariables: false,
    errorHandler: _restify2.default.errors.InvalidArgumentError
}));

//set json content type for all API
server.use(function (req, res, next) {
    res.header('Content-Type', 'application/json');
    return next();
});

server.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    return next();
});

//default 'welcome' endpoint
server.get('/', function (req, res, next) {
    res.send({
        message: "Welcome to BrewAPI",
        version: "1.0.0"
    });

    return next();
});

//define passport authentication strategy
(0, _authentications2.default)(_passport2.default, _models2.default);

//Setup users endpoint
(0, _users2.default)(server, _passport2.default);

//setup beers endpoints
(0, _beers2.default)(server, _passport2.default);

//setup breweries endpoints
(0, _breweries2.default)(server, _passport2.default);

//setup breweries geocodes endpoints
(0, _breweriesGeocodes2.default)(server, _passport2.default);

//authentication endpoint
(0, _auth2.default)(server);

//Catch errors
(0, _handleErrors2.default)(server);

//launch server !
server.listen('9090', function () {
    console.log('%s listening at %s', server.name, server.url);
});