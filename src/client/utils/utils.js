import { LEFT, RIGHT, ROT } from "../utils/move_piece.js";
import { piece$, rot$, pos$, next_pieces$ } from "../index.jsx";
import { tetrominoes } from "../../server/tetrominoes.js";

export const WIDTH = 10;
export const LENGTH = 20;
export const BUFFER = 2;

export const next_piece = (start = true) => {
  if (!piece$() || !start) {
    piece$(next_pieces$()[0]);
    next_pieces$(next_pieces$().slice(1));
    pos$(Math.floor((WIDTH - tetrominoes[piece$()][rot$()].length) / 2));
  }
};

export const next_rot = () => {
  return (rot$() + 1) % tetrominoes[piece$()].length;
};

export const board_to_block = (pos, col, row) => {
  return [
    (col - (pos % WIDTH) + WIDTH) % WIDTH,
    row - Math.floor(pos / WIDTH) - (col - (pos % WIDTH) < 0 || pos < 0),
  ];
};

export const block_to_board = (pos, col, row) => {
  return [
    ((pos % WIDTH) + col) % WIDTH,
    Math.floor(pos / WIDTH) + row + ((pos % WIDTH) + col >= WIDTH),
  ];
};

export const clear_full_rows = (board) => {
  let full_row = false;
  let full_row_count = 0;
  const new_board = board.slice().filter((v, i) => {
    if (i % WIDTH === 0) {
      full_row = false;
    }
    if (
      i % WIDTH === 0 &&
      board.slice(i, i + WIDTH).every((v2, _) => {
        return v2 !== "" && v2 !== "X";
      })
    ) {
      full_row = true;
      ++full_row_count;
    }
    return full_row === false;
  });
  return [
    Array.from([...Array(full_row_count * WIDTH).fill(""), ...new_board]),
    Math.max(0, 200 * full_row_count - 100 + 100 * (full_row_count === 4)),
  ];
};

export const add_block_to_board = (board) => {
  const new_board = board.map((v, i) => {
    const row = Math.floor(i / WIDTH);
    const col = (i + WIDTH) % WIDTH;
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
  return new_board;
};

export const can_move = (board, pos, direction, rotation) => {
  const piece = Array.from(tetrominoes[piece$()][rotation]).flat(1);
  const center_col = ((pos % WIDTH) + tetrominoes[piece$()][rotation].length / 2) % WIDTH;
  return piece.every((v, i) => {
    if (v != "") {
      const row = Math.floor(i / tetrominoes[piece$()][rotation].length);
      const col = i % tetrominoes[piece$()][rotation].length;
      const [board_col, board_row] = block_to_board(pos, col, row);

      if (
        board_row >= LENGTH + BUFFER ||
        board_col < 0 ||
        (board_col === 0 && direction === RIGHT) ||
        (board_col === 9 && direction === LEFT) ||
        (Math.abs(board_col - center_col) > 4 && direction & ROT) ||
        (board[board_row * WIDTH + board_col] != "" &&
          board[board_row * WIDTH + board_col] != undefined)
      ) {
        return false;
      }
    }
    return true;
  });
};
