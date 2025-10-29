import fs from "fs";
import { Piece } from "./Piece.js"
import { loginfo } from "./log.js";


export const players = new Map(); // Map<string,Player>
export const rooms = new Map();

export const join_room = (socket, room_id) => {
  socket.leave("lobby");
  socket.join(room_id);
  rooms.get(room_id).add_player(socket.id, players.get(socket.id).name);
  players.get(socket.id).room = room_id;
};

export const leave_room = (io, socket, room_id) => {
  if (room_id < 0 || !rooms.has(room_id)) return;
  
  const room = rooms.get(room_id);
  socket.leave(room_id);
  room.remove_player(socket.id);
  game_end(io, room_id);
  socket.to(room_id).emit("player_leave", socket.id);
  if (room.players.size === 0) {
    room.deleteTimeout = setTimeout(() => {
      const currentRoom = rooms.get(room_id);
      if (currentRoom && currentRoom.players.size === 0) {
        console.log("deleting room", room_id);
        rooms.delete(room_id);
        loginfo(`deleted room ${room_id}`);
        io.to("lobby").emit("room_update");
      }
      // ✅ clear the reference (self-cleaning)
      if (currentRoom) delete currentRoom.deleteTimeout;
    }, 200);
  }
};

export const give_pieces = (io, room_id, count) => {
  for (let index = 0; index < count; index++) {
    const piece = new Piece();
    io.to(room_id).emit("next_piece", piece.type);
  }
};

export const save_score = (socket, score, room_id, result) => {
  console.log("save_score", socket, score, room_id, result);
  if (score > 0) {
    let data = [];
    if (fs.existsSync(__dirname + "/history.json")) {
      data = JSON.parse(fs.readFileSync(__dirname + "/history.json", "utf-8"));
    }
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

export const game_end = (io, room_id) => {
  if (rooms.get(room_id) && rooms.get(room_id).is_playing) {
    const players_left = rooms.get(room_id).players_left;
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