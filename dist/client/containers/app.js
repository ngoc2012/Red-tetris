"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactRedux = require("react-redux");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var App = function App(_ref) {
  var message = _ref.message;
  return /*#__PURE__*/_react["default"].createElement("span", null, message);
};
var mapStateToProps = function mapStateToProps(state) {
  return {
    message: state.message
  };
};
var _default = exports["default"] = (0, _reactRedux.connect)(mapStateToProps, null)(App);