'use strict';
const util = require("util");

module.exports = function IllegalApplicationStatusChangeError(message, applicationId, statusFrom, statusTo) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.applicationId = applicationId;
  this.statusFrom = statusFrom;
  this.statusTo = statusTo;
};

util.inherits(module.exports, Error);