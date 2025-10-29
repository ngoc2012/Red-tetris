import http from "http";
import express from "express";
import path from "path";
import fs from "fs";
import { Server as SocketIO } from "socket.io";
import params  from '../../params.js';
import { socket_init } from './socket.js';
import { loginfo } from "./log.js";


const __dirname = process.cwd();
const initApp = (server, app, params, cb) => {
  const { host, port } = params;

  app.use((req, res, next) => {
    res.setHeader("ngrok-skip-browser-warning", "true");
    next();
  });

  app.use(express.static(path.join(__dirname, "/public")));
  app.use(express.static(path.join(__dirname, "/dist")));

  app.get("/api/history", (req, res) => {
    const data = JSON.parse(fs.readFileSync(__dirname + "/history.json", "utf-8"));
    res.json(data.reverse());
  });

  server.listen(port, () => {
    console.log(`Server running on http://${host}:${port}`);
    cb();
  });
  
};

export function create(params) {
  const promise = new Promise((resolve, reject) => {
    try {
      const app = express();
      const server = http.createServer(app);

      initApp(server, app, params, () => {
        const io = new SocketIO(server, {
          cors: {
            origin: "*",
          },
          path: '/ws/red/socket.io',
          transports: ['websocket'],  // Only use WebSocket
        });

        const stop = (cb) => {
          io.close();
          app.close(() => {
            app.unref();
          });
          loginfo(`Engine stopped.`);
          cb();
        };

        socket_init(io);
        resolve({ stop });
      });
    } catch (error) {
      reject(`Error while creating the app: ${error.message}`);
    }
  });
  return promise;
}

create(params.server).then( () => {
  console.log('not yet ready to play tetris with U ...');
  console.log('server started');
});