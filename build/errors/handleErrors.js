'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (server) {

  var handler = new _errorHandler2.default(server);

  //handle unique field error
  handler.handle('SequelizeUniqueConstraint', 406, 'Field must be unique');
};

var _errorHandler = require('./errorHandler');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }