import http from "http";
import express from "express";
import path from "path";
import fs from "fs";
import debug from "debug";
import { Server as SocketIO } from "socket.io";
import { Player } from "./Player.js";
import { Room } from "./Room.js";
import { Piece } from "./Piece.js";
import { Status } from "../common/enums.js";


const __dirname = process.cwd();

export const logerror = debug("tetris:error");
export const loginfo = debug("tetris:info");

const initApp = (server, app, params, cb) => {
  const { host, port } = params;

  app.use(express.static(path.join(__dirname, "/public")));
  app.use(express.static(path.join(__dirname, "/build")));

  app.get("/api/history", (req, res) => {
    const data = JSON.parse(fs.readFileSync(__dirname + "/history.json", "utf-8"));
    res.json(data.reverse());
  });

  server.listen(port, () => {
    console.log(`Server running on http://${host}:${port}`);
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

  const save_score = (socket, score, room_id, result) => {
    if (score > 0) {
      const data = JSON.parse(fs.readFileSync(__dirname + "/history.json", "utf-8"));
      const now = new Date();
      const formatted = now.toLocaleString("en-GB", {
        hour12: false,
      });
      data.push({
        time: formatted,
        room: room_id,
        name: players.get(socket).name,
        score: score,
        result: result,
      });
      fs.writeFileSync(__dirname + "/history.json", JSON.stringify(data, null, 2));
    }
  };

  const game_end = (room_id) => {
    if (rooms.get(room_id).is_playing) {
      const players_left = rooms.get(room_id).players_left;
      console.log("players_left", players_left);
      if (players_left.size <= 1) {
        if (players_left.size === 1) {
          const socket = players_left.keys().next().value;
          io.to(socket).emit("game_win");
          save_score(socket, rooms.get(room_id).get_score(socket), room_id, "game_win");
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

    socket.on("rename", ({ new_name }, callback) => {
      callback({ success: players.get(socket.id).rename(new_name) });
    });

    socket.on("new_room", (callback) => {
      const room_id = Room.count();
      rooms.set(room_id, new Room(io, socket.id));
      callback({ success: true, room_id: room_id });
      io.to("lobby").emit("room_update");
    });

    socket.on("join_room", (room_id, callback) => {
      console.log("join_room", room_id);
      if (!rooms.has(room_id) || rooms.get(room_id).status === Status.PLAYING) {
        callback({ success: false });
        return;
      }
      const room = rooms.get(room_id);
      join_room(socket, room_id);
      callback({ success: true, room: room.get_info() });
    });

    socket.on("leave_room", (room_id) => {
      if (room_id >= 0 && rooms.has(room_id)) {
        leave_room(socket, room_id);
        players.get(socket.id).room = "lobby";
        socket.join("lobby");
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
      const room = rooms.get(room_id);
      if (room.owner === socket.id && !room.is_playing) {
        room.start_game(io);
        io.to(room_id).emit("game_prep");
        io.to("lobby").emit("room_update");
        give_pieces(room_id, 4);
        callback({ success: true });
        io.to(room_id).emit("game_start", room.get_info());
      } else {
        callback({ success: false });
      }
    });

    socket.on("gamemode", (gamemode, room_id) => {
      const room = rooms.get(room_id);
      if (room.owner === socket.id) {
        room.gamemode = gamemode;
        io.to(room_id).emit("gamemode", gamemode);
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

    socket.on("board_update", ({ spectrum, penalty }) => {
      const room_id = players.get(socket.id).room;
      const room = rooms.get(room_id);
      if (!room) return;
      const player = room.update_spectrum(socket.id, spectrum, penalty);
      socket.to(room_id).emit("spectrum", {
        id: socket.id,
        name: players.get(socket.id).name,
        score: player.score,
        spectrum: player.spectrum,
        penalty: player.penalty,
      });
    });

    socket.on("game_over", (room_id) => {
      const room = rooms.get(room_id);
      if (!room) return;
      const score = room.get_score(socket.id);
      room.game_over(socket.id);
      game_end(room_id);
      loginfo(`${socket.id} has topped out with score ${score}`);
      save_score(socket.id, score, room_id, "game_over");
    });

    socket.on("cleared_a_line", (rows_cleared) => {
      const room_id = players.get(socket.id).room;
      const score = rooms
        .get(room_id)
        .update_score(
          socket.id,
          Math.max(0, 200 * rows_cleared - 100 + 100 * (rows_cleared === 4))
        );
      rooms.get(room_id).clear_rows(rows_cleared);

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

    socket.on("next_piece", () => {
      const room_id = players.get(socket.id).room;
      if (!room_id) return;
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
