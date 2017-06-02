'use strict';
const util = require("util");

module.exports = function CannotAssignRoleToSubjectError(message, userId, roleId) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.userId = userId;
  this.roleId = roleId;
};

util.inherits(module.exports, Error);