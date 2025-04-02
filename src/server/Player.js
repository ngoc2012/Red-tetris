export class Player {
  name;
  room;

  constructor(name = "player", room = "lobby") {
    this.name = name;
    this.room = room;
  }

  get name() {
    return this.name;
  }

  set name(value) {
    this.name = value;
  }

  get room() {
    return this.room;
  }

  set room(value) {
    this.room = value;
  }
}
