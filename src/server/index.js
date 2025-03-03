import fs from "fs";
import debug from "debug";
import { tetrominoes } from "./tetrominoes.js";

const logerror = debug("tetris:error"),
  loginfo = debug("tetris:info");

const initApp = (app, params, cb) => {
  const { host, port } = params;
  const handler = (req, res) => {
    if (req.url === "/favicon.ico") {
      res.writeHead(200, { "Content-Type": "image/x-icon" });
      var file = "/../../favicon.ico";
    } else if (req.url === "/bundle.js") {
      res.writeHead(200, { "Content-Type": "application/javascript" });
      var file = "/../../build/bundle.js";
    } else if (req.url === "/style.css") {
      res.writeHead(200, { "Content-Type": "text/css" });
      var file = "/../../style.css";
    } else if (req.url === "/Halstatt.jpg") {
      res.writeHead(200, { "Content-Type": "image/jpg" });
      var file = "/../../Halstatt.jpg";
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      var file = "/../../index.html";
    }

    fs.readFile(__dirname + file, (err, data) => {
      if (err) {
        logerror(err);
        res.writeHead(500);
        return res.end("Error loading index.html");
      }
      // res.writeHead(200);
      res.end(data);
    });
  };

  app.on("request", handler);

  app.listen({ host, port }, () => {
    loginfo(`tetris listen on ${params.url}`);
    cb();
  });
};

const initEngine = (io) => {
  io.on("connection", function (socket) {
    loginfo("Socket connected: " + socket.id);
    socket.on("action", (action) => {
      if (action.type === "server/ping") {
        socket.emit("action", { type: "pong" });
      }
    });
  });
};

import { createServer } from "http";
import { Server as SocketIO } from "socket.io";

let players = {}; // Global players object  {socket.id: {name: 'name', room: 'room_id'}}
let roomPlayers = {}; // Global roomPlayers object {room_id: {owner: socket.id, players: {socket.id: {penalty: 0, score: 0}}}
let roomCounter = 0; // Global room counter

export function create(params) {
  const promise = new Promise((resolve, reject) => {
    try {
      const app = createServer();
      initApp(app, params, () => {
        const io = new SocketIO(app, {
          cors: {
            origin: "*",
          },
        });

        io.on("connection", (socket) => {
          console.log("A user connected:", socket.id);
          socket.emit("connected", { id: socket.id });
          players[socket.id] = { name: "" + socket.id, room: null };

          socket.on("rename", ({ new_name }, callback) => {
            const isValidName = true;

            if (isValidName) {
              players[socket.id].name = new_name;
              console.log(`${socket.id} renamed to ${new_name}`);
              callback({ success: true });
            } else {
              callback({ success: false, message: "Invalid name" });
            }
          });

          socket.on("new_room", () => {
            const room_id = roomCounter++;
            socket.join(room_id);
            roomPlayers[room_id] = { owner: socket.id, players: {} };
            roomPlayers[room_id].players[socket.id] = { penalty: 0, score: 0 };
            socket.emit("new_room", { room_id });
            socket.emit("join_room_success", { room_id });
            console.log(`Room ${room_id} created by ${socket.id}`);
          });

          socket.on("join_room", ({ room_id }) => {
            socket.join(room_id);
            console.log(`${socket.id} joined room ${room_id}`);
          });

          socket.on("room_list", () => {
            socket.emit("room_list", { total_rooms: roomCounter - 1 });
          });

          socket.on("cleared_a_line", () => {
            const players = roomPlayers[players[socket.id].room].players;
            players[socket.id].score += 1;

            console.log(`New score for ${socket.id} is ${new_score}`);
            io.to(room_id).emit("room_update", roomPlayers);
          });

          socket.on("next_piece", ({ room_id }) => {
            console.log("next_piece", room_id);
            const keys = Object.keys(tetrominoes);
            io.to(room_id).emit(
              "next_piece",
              keys[Math.floor(Math.random() * keys.length)]
            );
          });

          socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
          });
        });

        const stop = (cb) => {
          io.close();
          app.close(() => {
            app.unref();
          });
          loginfo(`Engine stopped.`);
          cb();
        };

        initEngine(io);
        resolve({ stop });
      });
    } catch (error) {
      reject(`Error while creating the app: ${error.message}`);
    }
  });
  return promise;
}
