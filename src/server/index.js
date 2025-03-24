import fs from "fs";
import debug from "debug";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { tetrominoes } from "./tetrominoes.js";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logerror = debug("tetris:error"),
  loginfo = debug("tetris:info");

const initApp = (app, params, cb) => {
  const { host, port } = params;

  const handler = (req, res) => {
    loginfo(req.url);
    if (req.url === "/favicon.ico") {
      res.writeHead(200, { "Content-Type": "image/x-icon" });
      var file = "/../../public/favicon.ico";
    } else if (req.url === "/bundle.js") {
      res.writeHead(200, { "Content-Type": "application/javascript" });
      var file = "/../../build/bundle.js";
    } else if (req.url === "/style.css") {
      res.writeHead(200, { "Content-Type": "text/css" });
      var file = "/../../public/style.css";
    } else if (req.url === "/Halstatt.jpg") {
      res.writeHead(200, { "Content-Type": "image/jpg" });
      var file = "/../../public/Halstatt.jpg";
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      var file = "/../../public/index.html";
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

const check_name = (name) => {
  let code, index;
  const len = name.length;
  if (len < 1) {
    return false;
  }
  for (index = 0; index < len; index++) {
    code = name.charCodeAt(index);
    if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123) // lower alpha (a-z)
    ) {
      return false;
    }
  }
  return true;
};

const players = {}; // Global players object
//{
//  socket.id: {
//    name: 'name',
//    room: 'room_id'
//  }
//}
const rooms = {}; // Global roomPlayers object
//{
//  room_id: {
//    status: playing|waiting
//    owner: socket.id,
//    players: {
//      socket.id: {
//        penalty: 0,
//        score: 0
//      }
//    }
//  }
//}
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

        const join_room = (socket, room_id) => {
          socket.leave("lobby");
          socket.join(room_id);
          rooms[room_id].players[socket.id] = { penalty: 0, score: 0 };
          players[socket.id].room = room_id;
        };

        const leave_room = (socket, room_id) => {
          if (room_id < 0 || !rooms[room_id]) return;
          console.log("leave_room", room_id, socket.id);
          delete rooms[room_id].players[socket.id];
          if (Object.keys(rooms[room_id].players).length === 0) {
            // player was the last one in room
            delete rooms[room_id];
            io.to("lobby").emit("room_update");
            console.log(`deleted room ${room_id}`);
          } else if (rooms[room_id].owner === socket.id) {
            // player was owner of the room
            rooms[room_id].owner = Object.keys(rooms[room_id].players)[0];
            console.log(
              `transferred ownership of room ${room_id} to ${rooms[room_id].owner}`
            );
          }
        };

        io.on("connection", (socket) => {
          console.log("A user connected:", socket.id);
          socket.emit("connected", { id: socket.id });
          socket.join("lobby");
          players[socket.id] = { name: socket.id, room: "lobby" };
          console.log("players", players);

          socket.on("rename", ({ new_name }, callback) => {
            const isValidName = check_name(new_name);

            if (isValidName) {
              players[socket.id].name = new_name;
              console.log(`${socket.id} renamed to ${new_name}`);
              callback({ success: true });
            } else {
              callback({ success: false, message: "Invalid name" });
            }
          });

          socket.on("new_room", (callback) => {
            const room_id = roomCounter++;
            rooms[room_id] = {
              status: "waiting",
              owner: socket.id,
              players: {},
            };
            callback({ success: true, room_id: room_id });
            io.to("lobby").emit("room_update");
            console.log(`Room ${room_id} created by ${socket.id}`);
          });

          socket.on("join_room", (room_id, callback) => {
            console.log("join_room", room_id);
            if (!Object.hasOwn(rooms, room_id)) {
              callback({ success: false });
              return;
            }
            join_room(socket, room_id);
            callback({ success: true, room_id: room_id });
            console.log(`${socket.id} joined room ${room_id}`);
            // event to room: new player joined
          });

          socket.on("leave_room", (room_id) => {
            if (room_id >= 0) {
              socket.leave(room_id);
              leave_room(socket, room_id);
              players[socket.id].room = "lobby";
              console.log(`${socket.id} left room ${room_id}`);
              console.log("rooms", rooms);
              socket.join("lobby");
              // event to room: player left
            }
          });

          socket.on("room_list", (callback) => {
            callback(rooms);
          });

          socket.on("game_start", (room_id, callback) => {
            if (rooms[room_id].owner === socket.id) {
              rooms[room_id].status = "playing";
              callback({ success: true });
              io.to(room_id).emit("game_start");
            } else {
              callback({ success: false });
            }
          });

          socket.on("game_over", (room_id) => {
            // if last player remaining and not singleplayer mode
            // rooms[room_id].status = "waiting";
            // io.to(room_id).emit("game_over");
          });

          socket.on("cleared_a_line", (rows_cleared) => {
            const room_id = players[socket.id].room;
            const room_players = rooms[room_id].players;

            room_players[socket.id].score += Math.max(
              0,
              200 * rows_cleared - 100 + 100 * (rows_cleared === 4)
            );

            console.log(
              `New score for ${socket.id} is ${room_players[socket.id].score}`
            );
            io.to(room_id).emit("score_update", {
              id: socket.id,
              score: room_players[socket.id].score,
            });
          });

          socket.on("next_piece", ({ room_id }) => {
            if (
              !Object.hasOwn(rooms, room_id) ||
              !Object.hasOwn(rooms[room_id].players, socket.id)
            ) {
              return;
            }
            console.log("next_piece", room_id);
            const keys = Object.keys(tetrominoes);
            io.to(room_id).emit(
              "next_piece",
              keys[Math.floor(Math.random() * keys.length)]
            );
          });

          socket.on("disconnecting", () => {
            if (players[socket.id].room >= 0)
              leave_room(socket, players[socket.id].room);
          });

          socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            delete players[socket.id];
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
