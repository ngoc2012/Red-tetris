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
//    name: 'name'
//    room: 'room_id'
//  }
//}
const rooms = {}; // Global rooms object
//{
//  room_id: {
//    status: playing|waiting
//    owner: socket.id
//    players: {
//      socket.id: {
//        name:
//        playing: true
//        spectrum:
//        penalty:
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
          rooms[room_id].players[socket.id] = {
            name: players[socket.id].name,
            playing: false,
            spectrum: Array.from({ length: 10 }).fill(0),
            penalty: 0,
            score: 0,
          };
          players[socket.id].room = room_id;
        };

        const leave_room = (socket, room_id) => {
          if (room_id < 0 || !rooms[room_id]) return;
          delete rooms[room_id].players[socket.id];
          console.log(`${socket.id} has left room ${room_id}`);
          game_end(room_id);
          socket.to(room_id).emit("player_leave", socket.id);
          if (Object.keys(rooms[room_id].players).length === 0) {
            // player was the last one in room
            delete rooms[room_id];
            console.log(`deleted room ${room_id}`);
            io.to("lobby").emit("room_update");
          } else if (rooms[room_id].owner === socket.id) {
            // player was owner of the room
            rooms[room_id].owner = Object.keys(rooms[room_id].players)[0];
            console.log(
              `transferred ownership of room ${room_id} to ${rooms[room_id].owner}`
            );
          }
        };

        const give_pieces = (room_id, count) => {
          const keys = Object.keys(tetrominoes);
          for (let index = 0; index < count; index++) {
            io.to(room_id).emit(
              "next_piece",
              keys[Math.floor(Math.random() * keys.length)]
            );
          }
        };

        const game_end = (room_id) => {
          const players_left = Object.values(rooms[room_id].players).reduce(
            (acc, p, i) =>
              p.playing === true
                ? [...acc, Object.keys(rooms[room_id].players)[i]]
                : acc,
            []
          );
          console.log("players_left", players_left);
          if (players_left.length <= 1) {
            if (players_left.length === 1) {
              io.to(players_left[0]).emit("game_win");
            }
            rooms[room_id].status = "waiting";
            io.to(room_id).emit("game_over");
            io.to("lobby").emit("room_update");
          }
        };

        io.on("connection", (socket) => {
          console.log("A user connected:", socket.id);
          socket.emit("connected", { id: socket.id });
          socket.join("lobby");
          players[socket.id] = { name: "player", room: "lobby" };
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
            if (
              !Object.hasOwn(rooms, room_id) ||
              rooms[room_id].status == "playing"
            ) {
              callback({ success: false });
              return;
            }

            join_room(socket, room_id);
            callback({ success: true, room_id: room_id });
            console.log(`${socket.id} joined room ${room_id}`);
            console.log("rooms", rooms);
          });

          socket.on("leave_room", (room_id) => {
            if (room_id >= 0) {
              socket.leave(room_id);
              leave_room(socket, room_id);
              players[socket.id].room = "lobby";
              console.log("rooms", rooms);
              socket.join("lobby");
            }
          });

          socket.on("room_list", (callback) => {
            callback(
              Object.entries(rooms).reduce(
                (acc, p) => [...acc, { id: p[0], status: p[1].status }],
                []
              )
            );
          });

          socket.on("game_start", (room_id, callback) => {
            if (
              rooms[room_id].owner === socket.id &&
              rooms[room_id].status === "waiting"
            ) {
              rooms[room_id].status = "playing";
              for (const k in rooms[room_id].players) {
                rooms[room_id].players[k] = {
                  playing: true,
                  score: 0,
                };
              }
              io.to(room_id).emit("game_prep");
              give_pieces(room_id, 4);
              callback({ success: true });
              io.to(room_id).emit("game_start");
              io.to("lobby").emit("room_update");
              console.log("room", rooms[room_id]);
            } else {
              callback({ success: false });
            }
          });

          socket.on("spectrums", (callback) => {
            const room_id = players[socket.id].room;
            const spec = Object.entries(rooms[room_id].players)
              .filter(([key]) => ![socket.id].includes(key))
              .reduce(
                (acc, [k, v]) => ({
                  ...acc,
                  [k]: {
                    playerId: v.name,
                    score: v.score,
                    spec: v.spectrum,
                    penalty: v.penalty,
                  },
                }),
                {}
              );
            if (Object.keys(rooms[room_id].players).length < 2) {
              callback(null);
            }
            callback(spec);
          });

          socket.on("board_update", ({ spectrum, penalty, pieces_left }) => {
            const room_id = players[socket.id].room;
            give_pieces(room_id, 3 - pieces_left);
            rooms[room_id].players[socket.id].spectrum = spectrum;
            rooms[room_id].players[socket.id].penalty = penalty;
            socket.to(room_id).emit("spectrum", {
              id: socket.id,
              name: players[socket.id].name,
              score: rooms[room_id].players[socket.id].score,
              spectrum: spectrum,
              penalty: penalty,
            });
          });

          socket.on("game_over", (room_id) => {
            rooms[room_id].players[socket.id].playing = false;
            game_end(room_id);
            console.log(`room ${room_id}`, rooms[room_id]);
          });

          socket.on("cleared_a_line", (rows_cleared) => {
            const room_id = players[socket.id].room;
            const room_players = rooms[room_id].players;

            room_players[socket.id].score += Math.max(
              0,
              200 * rows_cleared - 100 + 100 * (rows_cleared === 4)
            );

            io.to(room_id).emit("score_update", {
              id: socket.id,
              score: room_players[socket.id].score,
            });
            console.log(
              `New score for ${socket.id} is ${room_players[socket.id].score}`
            );

            if (rows_cleared > 1) {
              socket.to(room_id).emit("penalty", rows_cleared - 1);
              console.log(
                `all players except ${socket.id} receive ${
                  rows_cleared - 1
                } garbage rows`
              );
            }
          });

          socket.on("next_piece", ({ room_id }) => {
            if (
              !Object.hasOwn(rooms, room_id) ||
              !Object.hasOwn(rooms[room_id].players, socket.id)
            ) {
              return;
            }
            console.log("next_piece", room_id);
            give_pieces(room_id, 1);
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
