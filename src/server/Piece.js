import { tetrominoes } from "../common/tetrominoes.js";

export class Piece {
  type; // string

  constructor() {
    const keys = Object.keys(tetrominoes);

    this.type = keys[Math.floor(Math.random() * keys.length)];
  }
}
