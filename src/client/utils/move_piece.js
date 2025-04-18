import {
  BUFFER,
  DOWN,
  LEFT,
  RIGHT,
  ROT,
  WIDTH,
} from "../../common/constants.js";
import { tetrominoes } from "../../common/tetrominoes.js";
import { piece$, pos$, rot$ } from "../index.jsx";
import socket from "../socket.js";
import { setBoard, setStatus } from "../store.js";
import {
  add_block_to_board,
  can_move,
  clear_full_rows,
  add_next_piece,
  next_rot,
} from "./utils.js";

export const move_left = (board) => {
  if (can_move(board, pos$() - 1, LEFT, rot$())) {
    pos$(pos$() - 1);
  }
};

export const move_right = (board) => {
  if (can_move(board, pos$() + 1, RIGHT, rot$())) {
    pos$(pos$() + 1);
  }
};

export const move_down = (board, dispatch) => {
  if (can_move(board, pos$() + WIDTH, DOWN, rot$())) {
    pos$(pos$() + WIDTH);
  } else {
    const [newBoard, rowsCleared] = clear_full_rows(add_block_to_board(board));
    if (newBoard.some((v, i) => i < BUFFER * WIDTH && v != "")) {
      dispatch(setStatus("game_over"));
    }
    dispatch(setBoard(newBoard));
    pos$((WIDTH + tetrominoes[piece$()].length) / 2);
    rot$(0);
    add_next_piece(false);
    if (rowsCleared > 0) {
      socket.emit("cleared_a_line", rowsCleared);
    }
  }
};

export const rotate_piece = (board) => {
  // rotation
  if (can_move(board, pos$(), ROT, next_rot())) {
    rot$(next_rot());
  } else if (
    // wall kick right
    can_move(board, pos$() + 1, RIGHT | ROT, next_rot())
  ) {
    pos$(pos$() + 1);
    rot$(next_rot());
  } else if (
    // wall kick left
    can_move(board, pos$() - 1, LEFT | ROT, next_rot())
  ) {
    pos$(pos$() - 1);
    rot$(next_rot());
  } else if (piece$() === "I") {
    // I piece specific wall kicks
    if (rot$() === 1 && can_move(board, pos$() + 2, RIGHT | ROT, next_rot())) {
      pos$(pos$() + 2);
      rot$(next_rot());
    } else if (
      rot$() === 3 &&
      can_move(board, pos$() - 2, LEFT | ROT, next_rot())
    ) {
      pos$(pos$() - 2);
      rot$(next_rot());
    }
  }
};

export const move_down_max = (board, dispatch) => {
  let dist = 0;
  while (can_move(board, pos$() + WIDTH * dist, DOWN, rot$())) {
    ++dist;
  }
  pos$(pos$() + WIDTH * (dist - 1));
  move_down(board, dispatch);
};
