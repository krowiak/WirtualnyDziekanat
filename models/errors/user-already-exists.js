'use strict';
const util = require("util");

module.exports = function UserAlreadyExistsError(message, originalUser) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.originalUser = originalUser;
};

util.inherits(module.exports, Error);