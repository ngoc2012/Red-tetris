export class RoomPlayer {
  constructor(name) {
    this.name = name;
    this.playing = false;
    this.spectrum = Array.from({ length: 10 }).fill(0);
    this.penalty = 0;
    this.score = 0;
  }
}