import { LEFT, RIGHT, ROT } from "../client/components/Board.jsx";
import { piece$ } from "../client/index.jsx";
import { tetrominoes } from "../server/tetrominoes.js";

export const can_move = (board, pos, direction, rotation) => {
  const piece = Array.from(tetrominoes[piece$()][rotation]).flat(1);
  const center_col = ((pos % 10) + tetrominoes[piece$()][rotation].length / 2) % 10;
  console.log("center_col", center_col);
  return piece.every((v, i) => {
    if (v != "") {
      console.log(i);
      const row = Math.floor(i / tetrominoes[piece$()][rotation].length);
      const col = i % tetrominoes[piece$()][rotation].length;
      const board_row = Math.floor(pos / 10) + row + ((pos % 10) + col > 9);
      const board_col = ((pos % 10) + col) % 10;

      console.log("board_row", board_row);
      console.log("board_col", board_col);
      if (
        board_row > 19 ||
        board_col < 0 ||
        (board_col === 0 && direction === RIGHT) ||
        (board_col === 9 && direction === LEFT) ||
        (Math.abs(board_col - center_col) > 4 && direction & ROT)
      ) {
        return false;
      }
    }
    return true;
  });
};
