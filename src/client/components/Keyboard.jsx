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


export const useKeyboard = (setGrid) => {

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
    // const subscription1 = flyd.combine(
    //   (pos$, rot$, piece$) => {
    //     setGrid(
    //       Array.from({ length: WIDTH * (LENGTH + BUFFER) }).map((_, i) => {
    //         const row = Math.floor(i / WIDTH);
    //         const col = (i + WIDTH) % WIDTH;
    //         const [block_col, block_row] = board_to_block(pos$(), col, row);

    //         if (
    //           piece$() &&
    //           block_row >= 0 &&
    //           block_row <= tetrominoes[piece$()][rot$()].length - 1 &&
    //           block_col >= 0 &&
    //           block_col <= tetrominoes[piece$()][rot$()][0].length - 1 &&
    //           tetrominoes[piece$()][rot$()][block_row][
    //             (block_col + WIDTH) % WIDTH
    //           ] == 1
    //         ) {
    //           return (
    //             <Square
    //               key={i}
    //               color={piece$()}
    //               filled={true}
    //               blocked={false}
    //             ></Square>
    //           );
    //         }
    //         return (
    //           <Square
    //             key={i}
    //             color={board[i]}
    //             filled={board[i] !== "" && mode !== Mode.INVIS}
    //             blocked={board[i] === "X"}
    //           ></Square>
    //         );
    //       })
    //     );
    //   },
    //   [pos$, rot$, piece$]
    // );
    // socket.emit("board_update", board_to_spectrum(board));

    return () => {
      subscription.end(true);
      // subscription1.end(true);
    };
  }, []);
};