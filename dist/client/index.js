"use strict";

var _react = _interopRequireDefault(require("react"));
var _reactDom = _interopRequireDefault(require("react-dom"));
var _reduxLogger = _interopRequireDefault(require("redux-logger"));
var _reduxThunk = require("redux-thunk");
var _redux = require("redux");
var _reactRedux = require("react-redux");
var _storeStateMiddleWare = require("./middleware/storeStateMiddleWare.js");
var _index = _interopRequireDefault(require("./reducers/index.js"));
var _app = _interopRequireDefault(require("./containers/app.js"));
var _alert = require("./actions/alert.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var initialState = {};
var store = (0, _redux.createStore)(_index["default"], initialState, (0, _redux.applyMiddleware)(_reduxThunk.thunk, (0, _reduxLogger["default"])()));
_reactDom["default"].render(/*#__PURE__*/_react["default"].createElement(_reactRedux.Provider, {
  store: store
}, /*#__PURE__*/_react["default"].createElement(_app["default"], null)), document.getElementById('tetris'));
store.dispatch((0, _alert.alert)('Soon, will be here a fantastic Tetris ...'));