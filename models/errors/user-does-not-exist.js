'use strict';
const util = require("util");

module.exports = function SubjectDoesNotExistError(message, subjectId) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.subjectId = subjectId;
};

util.inherits(module.exports, Error);