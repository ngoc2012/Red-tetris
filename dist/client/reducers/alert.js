"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _alert = require("../actions/alert.js");
var reducer = function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments.length > 1 ? arguments[1] : undefined;
  switch (action.type) {
    case _alert.ALERT_POP:
      return {
        message: action.message
      };
    default:
      return state;
  }
};
var _default = exports["default"] = reducer;