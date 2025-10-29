import { Player } from "./Player.js";
import { Room } from "./Room.js";
import { Status } from "../common/enums.js";
import { loginfo } from "./log.js";
import { players, rooms } from "./game.js";
import { join_room, leave_room } from "./game.js";
import { give_pieces } from "./game.js";
import { save_score } from "./game.js";
import { game_end } from "./game.js";


export function socket_init(io) {
  console.log("Initializing socket.io...");
  io.on("connection", (socket) => {
    loginfo("Socket connected: " + socket.id);
    console.log("Socket connected: " + socket.id);
    socket.emit("connected", { id: socket.id });
    socket.join("lobby");
    players.set(socket.id, new Player());

    socket.on("rename", ({ new_name }, callback) => {
      callback({ success: players.get(socket.id).rename(new_name) });
    });

    socket.on("new_room", (callback) => {
      const room_id = Room.count();
      // console.log("new_room", room_id);
      rooms.set(room_id, new Room(io, socket.id));
      // console.log("rooms", rooms);
      callback({ success: true, room_id: room_id });
      io.to("lobby").emit("room_update");
    });

    socket.on("join_room", (room_id, callback) => {
      // console.log("join_room", room_id);
      if (!rooms.has(room_id) || rooms.get(room_id).status === Status.PLAYING) {
        callback({ success: false });
        return;
      }
      const room = rooms.get(room_id);
      join_room(socket, room_id);
      callback({ success: true, room: room.get_info() });
    });

    socket.on("leave_room", (room_id) => {
      // console.log("leave_room", room_id);
      if (room_id >= 0 && rooms.has(room_id)) {
        leave_room(io, socket, room_id);
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
        give_pieces(io, room_id, 4);
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
      if (!players.has(socket.id)) {
        callback(null);
        return;
      }
      const room_id = players.get(socket.id).room;
      if (room_id < 0 || !rooms.has(room_id)) {
        callback(null);
        return;
      }
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
      console.log("game_over received", socket.id, room_id);
      const room = rooms.get(room_id);
      if (!room) return;
      const score = room.get_score(socket.id);
      room.game_over(socket.id);
      console.log(rooms);
      console.log("game_over", socket.id, room_id);
      game_end(io, room_id);
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
      give_pieces(io, room_id, 1);
    });

    socket.on("disconnecting", () => {
      if (players.get(socket.id).room >= 0)
        leave_room(io, socket, players.get(socket.id).room);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      players.delete(socket.id);
    });
  });
};