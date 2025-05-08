import {
  BUFFER,
  DOWN,
  LEFT,
  RIGHT,
  ROT,
  WIDTH,
  LENGTH,
} from "../../common/constants.js";
import { PieceState } from "../../common/enums.js";
import { tetrominoes } from "../../common/tetrominoes.js";
import { next_pieces$, fall_count$, lock_count$, piece$, pos$, rot$, state$ } from "../index.jsx";
import socket from "../socket.js";
import { setBoard, setStatus } from "../store.js";
import {
  block_to_board,
  add_block_to_board,
  clear_full_rows,
  next_rot,
} from "./utils.js";
import { store } from "../store.js";


export const move_left = () => {
  if (can_move(pos$() - 1, LEFT, rot$())) {
    pos$(pos$() - 1);
  }
};

export const move_right = () => {
  if (can_move(pos$() + 1, RIGHT, rot$())) {
    pos$(pos$() + 1);
  }
};

export const place_piece = () => {
  console.log("Placing piece");
  add_block_to_board();
  const rowsCleared = clear_full_rows();

  const board = store.getState().game_state.board;
  if (newBoard.some((v, i) => i < BUFFER * WIDTH && v != "")) {
    store.dispatch(setStatus("game_over"));
    return;
  }
  // dispatch(setBoard(newBoard));
  store.dispatch(setBoard(newBoard));
  piece$(next_pieces$()[0]);
  console.log("Next piece: ", next_pieces$()[0], piece$());
  pos$((WIDTH + tetrominoes[piece$()].length) / 2);
  rot$(0);
  next_pieces$(next_pieces$().slice(1));
  socket.emit("next_piece");
  // add_next_piece(false);
  if (rowsCleared > 0) socket.emit("cleared_a_line", rowsCleared);
};

export const move_down = () => {
  if (can_move(pos$() + WIDTH, DOWN, rot$())) {
    state$(PieceState.FALLING);
    lock_count$(0);
    fall_count$(0);
    pos$(pos$() + WIDTH);
  } else
    place_piece();
};

export const rotate_piece = () => {
  // rotation
  if (can_move(pos$(), ROT, next_rot())) {
    rot$(next_rot());
  } else if (
    // wall kick right
    can_move(pos$() + 1, RIGHT | ROT, next_rot())
  ) {
    pos$(pos$() + 1);
    rot$(next_rot());
  } else if (
    // wall kick left
    can_move(pos$() - 1, LEFT | ROT, next_rot())
  ) {
    pos$(pos$() - 1);
    rot$(next_rot());
  } else if (piece$() === "I") {
    // I piece specific wall kicks
    if (rot$() === 1 && can_move(pos$() + 2, RIGHT | ROT, next_rot())) {
      pos$(pos$() + 2);
      rot$(next_rot());
    } else if (
      rot$() === 3 &&
      can_move(pos$() - 2, LEFT | ROT, next_rot())
    ) {
      pos$(pos$() - 2);
      rot$(next_rot());
    }
  }
};

export const move_down_max = () => {
  let dist = 0;
  while (can_move(pos$() + WIDTH * dist, DOWN, rot$())) {
    ++dist;
  }
  pos$(pos$() + WIDTH * (dist - 1));
  move_down();
};

export const can_move = (pos, direction, rotation) => {
  const board = store.getState().game_state.board;
  const piece = Array.from(tetrominoes[piece$()][rotation]).flat(1);
  // console.log(piece);
  const center_col =
    ((pos % WIDTH) + tetrominoes[piece$()][rotation].length / 2) % WIDTH;
  return piece.every((v, i) => {
    // console.log(v);
    if (v === 1) {
      const row = Math.floor(i / tetrominoes[piece$()][rotation].length);
      const col = i % tetrominoes[piece$()][rotation].length;
      const [board_col, board_row] = block_to_board(pos, col, row);
      // console.log(
      //   `piece: ${piece$()} row: ${row} col: ${col} board_row: ${board_row} board_col: ${board_col}`
      // );
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