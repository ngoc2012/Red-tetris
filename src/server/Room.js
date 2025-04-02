export const Status = Object.freeze({
  PLAYING: "playing",
  WAITING: "waiting",
});

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
  status;
  owner;
  players;
  constructor(owner) {
    this.room_counter++;
    this.status = Status.WAITING;
    this.owner = owner;
    this.players = new Map(); // Map<string,RoomPlayer>
  }
  get owner() {
    return this.owner;
  }
  get players() {
    return this.players;
  }
}
