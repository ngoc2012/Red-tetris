import { key$, pos$, rot$ } from "../index.jsx";
import { setBoard } from "../store.js";
import { add_block_to_board, can_move, next_piece, next_rot } from "./utils.js";

export const RIGHT = 1;
export const LEFT = 2;
export const DOWN = 4;
export const ROT = 8;

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
  if (can_move(board, pos$() + 10, DOWN, rot$())) {
    pos$(pos$() + 10);
  } else {
    dispatch(setBoard(add_block_to_board(board)));
    pos$(0);
    rot$(0);
    key$("");
    next_piece(false);
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
  }
};
