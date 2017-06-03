'use strict';
const util = require("util");

module.exports = function GradeDoesNotExistError(message, userId, subjectId, attempt) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.userId = userId;
  this.subjectId = subjectId;
  this.attempt = attempt;
};

util.inherits(module.exports, Error);