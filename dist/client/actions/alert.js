"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.alert = exports.ALERT_POP = void 0;
var ALERT_POP = exports.ALERT_POP = 'ALERT_POP';
var alert = exports.alert = function alert(message) {
  return {
    type: ALERT_POP,
    message: message
  };
};