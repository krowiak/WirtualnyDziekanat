'use strict';
const util = require("util");

module.exports = function UserDoesNotExistError(message, userId) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.userId = userId;
};

util.inherits(module.exports, Error);