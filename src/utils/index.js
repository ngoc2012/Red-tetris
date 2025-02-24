import { piece$ } from "../client/index.jsx";
import { tetrominoes } from "../server/tetrominoes.js";

export const can_move = (board, pos, rotation) => {
  const piece = Array.from(tetrominoes[piece$()][rotation]);
  piece.every((v, i) => {
    if (v != "") {
      const row = Math.floor(i / 10);
      const col = i % 10;
      const board_row = Math.floor(pos / 10) + row;
      const board_col = (pos % 10) + col;

      if (board[pos]) {
        if (board[pos] != "") {
          return false;
        }
      } else return false;
    }
  });
  return true;
};
