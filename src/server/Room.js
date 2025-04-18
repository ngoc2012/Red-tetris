import { Mode, Status } from "../common/enums.js";
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
  id;
  mode;
  level;
  status;
  interval;
  owner;
  players; // Map<string,RoomPlayer>
  constructor(owner) {
    this.id = Room.room_counter.toString();
    Room.room_counter++;
    this.mode = Mode.NORMAL;
    this.level = 5;
    this.status = Status.WAITING;
    this.interval = null;
    this.owner = owner;
    this.players = new Map();
    loginfo(`Room ${this.id} created by ${owner}`);
  }
  get owner() {
    return this.owner;
  }
  get players() {
    return this.players;
  }
  get players_left() {
    return new Map([...this.players].filter(([_, v]) => v.playing === true));
  }
  get is_playing() {
    return this.status === Status.PLAYING;
  }

  add_player(id, name) {
    this.players.set(id, new RoomPlayer(name));
    loginfo(`${id} joined room ${this.id}`);
  }

  remove_player(id) {
    this.players.delete(id);
    loginfo(`${id} left room ${this.id}`);
    if (this.owner === id) {
      this.owner = this.players.keys().next().value;
      loginfo(`transferred ownership of room ${this.id} to ${this.owner}`);
    }
  }

  start_game(io) {
    this.status = Status.PLAYING;
    this.players.forEach((v) => {
      v.playing = true;
      v.score = 0;
    });
    this.interval = setInterval(() => {
      io.to(this.id).emit("game_loop");
    }, Math.pow(0.8 - (this.level - 1) * 0.007, this.level - 1) * 1000);
  }

  end_game() {
    this.status = Status.WAITING;
    clearInterval(this.interval);
    this.interval = null;
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
    this.players.get(player_id).playing = false;
  }

  update_spectrum(player_id, spectrum, penalty) {
    this.players.get(player_id).spectrum = spectrum;
    this.players.get(player_id).penalty = penalty;
    return this.players.get(player_id);
  }

  update_score(player_id, amount) {
    this.players.get(player_id).score += amount;
    loginfo(
      `New score for ${player_id} is ${this.players.get(player_id).score}`
    );
    return this.players.get(player_id).score;
  }

  static count() {
    return Room.room_counter.toString();
  }
}
