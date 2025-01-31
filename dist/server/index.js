"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
var _fs = _interopRequireDefault(require("fs"));
var _debug = _interopRequireDefault(require("debug"));
var _http = require("http");
var _socket = require("socket.io");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var logerror = (0, _debug["default"])('tetris:error'),
  loginfo = (0, _debug["default"])('tetris:info');
var initApp = function initApp(app, params, cb) {
  var host = params.host,
    port = params.port;
  var handler = function handler(req, res) {
    var file = req.url === '/bundle.js' ? '/../../build/bundle.js' : '/../../index.html';
    _fs["default"].readFile(__dirname + file, function (err, data) {
      if (err) {
        logerror(err);
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead(200);
      res.end(data);
    });
  };
  app.on('request', handler);
  app.listen({
    host: host,
    port: port
  }, function () {
    loginfo("tetris listen on ".concat(params.url));
    cb();
  });
};
var initEngine = function initEngine(io) {
  io.on('connection', function (socket) {
    loginfo("Socket connected: " + socket.id);
    socket.on('action', function (action) {
      if (action.type === 'server/ping') {
        socket.emit('action', {
          type: 'pong'
        });
      }
    });
  });
};
function create(params) {
  var promise = new Promise(function (resolve, reject) {
    try {
      var app = (0, _http.createServer)();
      initApp(app, params, function () {
        var io = new _socket.Server(app);
        var stop = function stop(cb) {
          io.close();
          app.close(function () {
            app.unref();
          });
          loginfo("Engine stopped.");
          cb();
        };
        initEngine(io);
        resolve({
          stop: stop
        });
      });
    } catch (error) {
      reject("Error while creating the app: ".concat(error.message));
    }
  });
  return promise;
}