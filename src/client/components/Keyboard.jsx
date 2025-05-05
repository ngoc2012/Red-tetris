import React, { useEffect } from "react";
import flyd from "flyd";
import {
  // add_penalty,
  board_to_block,
  // board_to_spectrum,
  // can_move,
} from "../utils/utils.js";
import {
  move_down,
  move_down_max,
  move_left,
  move_right,
  rotate_piece,
} from "../utils/move_piece.js";
import { pos$, rot$, key$, piece$ } from "../index.jsx";
import { Square } from "./Square.jsx";
import { BUFFER, DOWN, LENGTH, WIDTH } from "../../common/constants.js";
import { tetrominoes } from "../../common/tetrominoes.js";
import { useDispatch, useSelector } from "react-redux";


export const useKeyboard = () => {

  const board = useSelector((state) => state.game_state.board);
  const dispatch = useDispatch();

  useEffect(() => {
    const subscription = flyd.map((key) => {
      if (!piece$() || !key) {
        return;
      }
      // Key pressed logic here
      switch (key) {
        case "ArrowRight":
          move_right(board);
          break;
        case "ArrowLeft":
          move_left(board);
          break;
        case "ArrowDown":
          move_down(board, dispatch);
          break;
        case "ArrowUp":
          rotate_piece(board);
          break;
        case " ":
          move_down_max(board, dispatch);
          break;
        default:
          break;
      }
      console.log(key);
      key$("");
    }, key$);

    return () => {
      subscription.end(true);
    };
  }, []);
};