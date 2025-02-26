import { LEFT, RIGHT, ROT } from "../client/components/Board.jsx";
import { piece$, rot$, pos$ } from "../client/index.jsx";
import { tetrominoes } from "../server/tetrominoes.js";

export const next_rot = () => {
  return (rot$() + 1) % tetrominoes[piece$()].length;
};

export const board_to_block = (pos, col, row) => {
  return [
    (col - (pos % 10) + 10) % 10,
    row - Math.floor(pos / 10) - (col - (pos % 10) < 0 || pos < 0),
  ];
};

export const block_to_board = (pos, col, row) => {
  return [((pos % 10) + col) % 10, Math.floor(pos / 10) + row + ((pos % 10) + col > 9)];
};

export const add_block = (board) => {
  return board.map((v, i) => {
    const row = Math.floor(i / 10);
    const col = (i + 10) % 10;
    const [block_col, block_row] = board_to_block(pos$(), col, row);
    if (
      block_row >= 0 &&
      block_row <= tetrominoes[piece$()][rot$()].length - 1 &&
      block_col >= 0 &&
      block_col <= tetrominoes[piece$()][rot$()][0].length - 1 &&
      tetrominoes[piece$()][rot$()][block_row][block_col] == 1
    ) {
      return piece$();
    }
    return v;
  });
};

export const can_move = (board, pos, direction, rotation) => {
  const piece = Array.from(tetrominoes[piece$()][rotation]).flat(1);
  const center_col = ((pos % 10) + tetrominoes[piece$()][rotation].length / 2) % 10;
  return piece.every((v, i) => {
    if (v != "") {
      const row = Math.floor(i / tetrominoes[piece$()][rotation].length);
      const col = i % tetrominoes[piece$()][rotation].length;
      const [board_col, board_row] = block_to_board(pos, col, row);

      if (
        board_row > 19 ||
        board_col < 0 ||
        (board_col === 0 && direction === RIGHT) ||
        (board_col === 9 && direction === LEFT) ||
        (Math.abs(board_col - center_col) > 4 && direction & ROT) ||
        (board[board_row * 10 + board_col] != "" &&
          board[board_row * 10 + board_col] != undefined)
      ) {
        return false;
      }
    }
    return true;
  });
};
