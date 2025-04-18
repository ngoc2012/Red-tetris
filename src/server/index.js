import fs from "fs";
import debug from "debug";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";
import { Player } from "./Player.js";
import { Room } from "./Room.js";
import { Piece } from "./Piece.js";
import { Mode, Status } from "../common/enums.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logerror = debug("tetris:error");
export const loginfo = debug("tetris:info");
const logdebug = debug("tetris:debug");

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
  const players = new Map(); // Map<string,Player>
  const rooms = new Map();

  const join_room = (socket, room_id) => {
    socket.leave("lobby");
    socket.join(room_id);
    rooms.get(room_id).add_player(socket.id, players.get(socket.id).name);
    players.get(socket.id).room = room_id;
  };

  const leave_room = (socket, room_id) => {
    if (room_id < 0 || !rooms.has(room_id)) return;
    socket.leave(room_id);
    rooms.get(room_id).remove_player(socket.id);
    game_end(room_id);
    socket.to(room_id).emit("player_leave", socket.id);
    if (rooms.get(room_id).players.size === 0) {
      // player was the last one in room
      rooms.delete(room_id);
      loginfo(`deleted room ${room_id}`);
      io.to("lobby").emit("room_update");
    }
  };

  const give_pieces = (room_id, count) => {
    for (let index = 0; index < count; index++) {
      const piece = new Piece();
      io.to(room_id).emit("next_piece", piece.type);
    }
  };

  const game_end = (room_id) => {
    if (rooms.get(room_id).is_playing) {
      const players_left = rooms.get(room_id).players_left;
      console.log("players_left", players_left);
      if (players_left.size <= 1) {
        if (players_left.size === 1) {
          io.to(players_left.keys().next().value).emit("game_win");
        }
        rooms.get(room_id).end_game();
        io.to(room_id).emit("game_over");
        io.to("lobby").emit("room_update");
      }
    }
  };

  io.on("connection", (socket) => {
    loginfo("Socket connected: " + socket.id);
    socket.emit("connected", { id: socket.id });
    socket.join("lobby");
    players.set(socket.id, new Player());
    console.log("players", players);
    console.log("rooms", rooms);

    socket.on("rename", ({ new_name }, callback) => {
      if (check_name(new_name)) {
        players.get(socket.id).name = new_name;
        console.log(`${socket.id} renamed to ${new_name}`);
        callback({ success: true });
      } else {
        callback({ success: false });
      }
    });

    socket.on("new_room", (callback) => {
      const room_id = Room.count();
      rooms.set(room_id, new Room(socket.id));
      callback({ success: true, room_id: room_id });
      io.to("lobby").emit("room_update");
    });

    socket.on("join_room", (room_id, callback) => {
      if (!rooms.has(room_id) || rooms.get(room_id).status === Status.PLAYING) {
        callback({ success: false });
        return;
      }

      join_room(socket, room_id);
      callback({ success: true, room: { id: room_id, mode: Mode.NORMAL } });
      console.log("players", players);
      console.log("rooms", rooms);
    });

    socket.on("leave_room", (room_id) => {
      if (room_id >= 0 && rooms.has(room_id)) {
        leave_room(socket, room_id);
        players.get(socket.id).room = "lobby";
        socket.join("lobby");
        console.log("rooms", rooms);
        console.log("players", players);
      }
    });

    socket.on("room_list", (callback) => {
      callback(
        [...rooms].reduce(
          (acc, p) => [...acc, { id: p[0], status: p[1].status }],
          []
        )
      );
    });

    socket.on("game_start", (room_id, callback) => {
      if (
        rooms.get(room_id).owner === socket.id &&
        !rooms.get(room_id).is_playing
      ) {
        rooms.get(room_id).start_game(io);
        io.to(room_id).emit("game_prep");
        io.to("lobby").emit("room_update");
        give_pieces(room_id, 4);
        callback({ success: true });
        io.to(room_id).emit("game_start");
        console.log(`room ${room_id}`, rooms.get(room_id));
      } else {
        callback({ success: false });
      }
    });

    socket.on("spectrums", (callback) => {
      const room_id = players.get(socket.id).room;
      const spec = rooms.get(room_id).spectrums(socket.id);
      if (rooms.get(room_id).players.size < 2) {
        callback(null);
      }
      callback(spec);
    });

    socket.on("board_update", ({ spectrum, penalty, pieces_left }) => {
      const room_id = players.get(socket.id).room;
      give_pieces(room_id, 3 - pieces_left);
      const player = rooms
        .get(room_id)
        .update_spectrum(socket.id, spectrum, penalty);
      socket.to(room_id).emit("spectrum", {
        id: socket.id,
        name: players.get(socket.id).name,
        score: player.score,
        spectrum: player.spectrum,
        penalty: player.penalty,
      });
    });

    socket.on("game_over", (room_id) => {
      // save score somewhere with the mode (single/multi, normal/invis/accelerating/etc...)
      rooms.get(room_id).game_over(socket.id);
      game_end(room_id);
      loginfo(`${socket.id} has topped out`);
      console.log(`room ${room_id}`, rooms.get(room_id));
    });

    socket.on("cleared_a_line", (rows_cleared) => {
      const room_id = players.get(socket.id).room;
      const score = rooms
        .get(room_id)
        .update_score(
          socket.id,
          Math.max(0, 200 * rows_cleared - 100 + 100 * (rows_cleared === 4))
        );

      io.to(room_id).emit("score_update", {
        id: socket.id,
        score: score,
      });

      if (rows_cleared > 1) {
        socket.to(room_id).emit("penalty", rows_cleared - 1);
        loginfo(
          `all players receive ${rows_cleared - 1} garbage rows from ${
            socket.id
          }`
        );
      }
    });

    socket.on("next_piece", ({ room_id }) => {
      if (!rooms.has(room_id) || !rooms.get(room_id).players.has(socket.id)) {
        return;
      }
      console.log("next_piece", room_id);
      give_pieces(room_id, 1);
    });

    socket.on("disconnecting", () => {
      if (players.get(socket.id).room >= 0)
        leave_room(socket, players.get(socket.id).room);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      players.delete(socket.id);
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
