import React, { useEffect } from "react";
import flyd from "flyd";
import {
  move_down,
  move_down_max,
  move_left,
  move_right,
  rotate_piece,
  can_move,
  place_piece,
} from "../utils/move_piece.js";
import { lock_count$, fall_count$, state$, pos$, rot$, key$, piece$ } from "../index.jsx";
import { Square } from "./Square.jsx";
import { BUFFER, DOWN, LENGTH, WIDTH } from "../../common/constants.js";
import { tetrominoes } from "../../common/tetrominoes.js";
import { useDispatch, useSelector } from "react-redux";
import {PieceState} from "../../common/enums.js";


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
          // move_down(board, dispatch);
          if (can_move(board, pos$() + WIDTH, DOWN, rot$())) {
            state$(PieceState.FALLING);
            lock_count$(0);
            fall_count$(0);
            pos$(pos$() + WIDTH);
          } else {
            console.log("ArrowDown, Placing piece");
            place_piece(board, dispatch);
          }
            
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

    const onKeyDown = (event) => { key$(event.key); };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      subscription.end(true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
};