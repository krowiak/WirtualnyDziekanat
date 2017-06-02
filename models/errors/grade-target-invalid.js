'use strict';
const util = require("util");

module.exports = function GradeTargetInvalidError(message, userId, subjectId) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.userId = userId;
  this.subjectId = subjectId;
};

util.inherits(module.exports, Error);