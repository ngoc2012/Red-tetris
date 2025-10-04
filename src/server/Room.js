import { Gamemode, Mode, Status } from "../common/enums.js";
import { LEVEL_UP, MAX_LEVEL } from "../common/constants.js";
import { loginfo } from "./index.js";

export class RoomPlayer {
  constructor(name) {
    this.name = name;
    this.playing = false;
    this.spectrum = Array.from({ length: 10 }).fill(0);
    this.penalty = 0;
    this.score = 0;
  }
}

export class Room {
  static room_counter = 0;
  io;
  id;
  mode;
  gamemode;
  level;
  rows_cleared;
  status;
  owner;
  players; // Map<string,RoomPlayer>
  deleteTimeout;
  constructor(io, owner) {
    this.io = io;
    this.id = Room.room_counter.toString();
    Room.room_counter++;
    this.mode = Mode.SINGLE;
    this.gamemode = Gamemode.NORMAL;
    this.rows_cleared = 0;
    this.level = 0;
    this.status = Status.WAITING;
    this.owner = owner;
    this.players = new Map();
    this.deleteTimeout = null;
    loginfo(`Room ${this.id} created by ${owner}`);
    console.log(`Room ${this.id} created by ${owner}`);
  }
  get players_left() {
    return new Map([...this.players].filter(([, v]) => v.playing === true));
  }
  get is_playing() {
    return this.status === Status.PLAYING;
  }

  get_info() {
    return {
      id: this.id,
      mode: this.mode,
      gamemode: this.gamemode,
      level: this.level,
      rows_cleared: this.rows_cleared,
      status: this.status,
      players: [...this.players].map(([key, value]) => ({
        id: key,
        name: value.name,
        playing: value.playing,
        score: value.score,
        penalty: value.penalty,
        spectrum: value.spectrum,
      })),
    };
  }

  get_score(player_id) {
    const player = this.players.get(player_id);
    if (!player) return null;
    return this.players.get(player_id).score;
  }

  add_player(id, name) {
    this.players.set(id, new RoomPlayer(name));
    loginfo(`${id} joined room ${this.id}`);
  }

  remove_player(id) {
    this.players.delete(id);
    loginfo(`${id} left room ${this.id}`);
    if (this.owner === id && this.players.keys().next().value) {
      this.owner = this.players.keys().next().value;
      loginfo(`transferred ownership of room ${this.id} to ${this.owner}`);
    }
  }

  start_game() {
    if (this.players.size > 1) {
      this.mode = Mode.MULTI;
    } else {
      this.mode = Mode.SINGLE;
    }
    this.level = 0;
    this.rows_cleared = 0;
    this.status = Status.PLAYING;
    this.players.forEach((v) => {
      v.playing = true;
      v.score = 0;
    });
  }

  end_game() {
    this.status = Status.WAITING;
  }

  spectrums(player_id) {
    return [...this.players]
      .filter(([key]) => ![player_id].includes(key))
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
  }

  game_over(player_id) {
    const player = this.players.get(player_id);
    if (!player) return null;
    player.playing = false;
  }

  update_spectrum(player_id, spectrum, penalty) {
    const player = this.players.get(player_id);
    if (!player) return null;
    player.spectrum = spectrum;
    player.penalty = penalty;
    return player;
  }

  update_score(player_id, amount) {
    const player = this.players.get(player_id);
    if (!player) return null;
    player.score += amount;
    loginfo(
      `New score for ${player_id} is ${this.players.get(player_id).score}`
    );
    return this.players.get(player_id).score;
  }

  clear_rows(amount) {
    if (this.gamemode !== Gamemode.ACCEL || this.level >= MAX_LEVEL) return;
    this.rows_cleared += amount;
    if (this.rows_cleared >= LEVEL_UP) {
      this.rows_cleared -= LEVEL_UP;
      this.level++;
      this.io.to(this.id).emit("level", this.level);
    }
  }

  static count() {
    return Room.room_counter.toString();
  }
}
