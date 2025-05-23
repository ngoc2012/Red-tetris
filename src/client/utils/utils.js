import { piece$, rot$, pos$, next_pieces$ } from "../streams.js";
import { tetrominoes } from "../../common/tetrominoes.js";
import { store, setBoard, resetBoard, setScore } from "../store.js";
import { BUFFER, WIDTH } from "../../common/constants.js";
import { Status } from "../../common/enums.js";

export const reset = () => {
  store.dispatch(resetBoard());
  store.dispatch(setScore(0));
  next_pieces$([]);
  piece$("");
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

export const add_penalty = (rows) => {
  if (rows <= 0 || store.getState().game_state.status !== Status.PLAYING) return;
  pos$(Math.max(pos$() - rows * WIDTH, pos$()));
  const board = store.getState().game_state.board;
  store.dispatch(setBoard(Array.from([
    ...board.slice(rows * WIDTH),
    ...Array(rows * WIDTH).fill("X"),
  ])));
};

export const board_to_spectrum = () => {
  const spectrum = Array.from({ length: 10 }).fill(0);
  const board = store.getState().game_state.board;

  for (let index = BUFFER * WIDTH; index < board.length; index++) {
    if (board[index] === "X") {
      return {
        spectrum: spectrum,
        penalty: (220 - index) / WIDTH,
      };
    }
    if (board[index] !== "" && spectrum[index % WIDTH] === 0) {
      spectrum[index % WIDTH] = (220 - (index - (index % WIDTH))) / WIDTH;
    }
  }
  return { spectrum: spectrum, penalty: 0 };
};

export const clear_full_rows = () => {
  let full_row = false;
  let full_row_count = 0;
  const board = store.getState().game_state.board;
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
  store.dispatch(setBoard(Array.from(
    [...Array(full_row_count * WIDTH).fill(""), ...new_board]
  )));
  return full_row_count;
};

export const add_block_to_board = () => {
  const board = store.getState().game_state.board;
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
  store.dispatch(setBoard(new_board));
};


