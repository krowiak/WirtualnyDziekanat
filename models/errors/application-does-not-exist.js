'use strict';
const util = require("util");

module.exports = function ApplicationDoesNotExistError(message, applicationId) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.applicationId = applicationId;
};

util.inherits(module.exports, Error);