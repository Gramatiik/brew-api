"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This class is used for simple error handling
 * it listens for server specific error name and sends custom response code and message
 */
var errorHandler = function () {
    function errorHandler(server) {
        _classCallCheck(this, errorHandler);

        this.srv = server;
    }

    /**
     * handle specific error
     * @param errName name of the error to catch
     *        (i.e. 'InternalServerError' minus the 'Error' part, so you should write 'InternalServer')
     * @param responseCode response http code to send
     * @param message
     */


    _createClass(errorHandler, [{
        key: "handle",
        value: function handle(errName, responseCode, message) {
            this.srv.on(errName, function (req, res, err) {
                res.send(responseCode, {
                    error: {
                        code: err.name,
                        message: message
                    }
                });
            });
        }
    }]);

    return errorHandler;
}();

exports.default = errorHandler;