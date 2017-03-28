'use strict';
const util = require("util");

module.exports = function LoginFailedError(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
};

util.inherits(module.exports, Error);