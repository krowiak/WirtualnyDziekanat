'use strict';
const util = require("util");

module.exports = function SubjectAlreadyExistsError(message, originalSubject) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.originalSubject = originalSubject;
};

util.inherits(module.exports, Error);