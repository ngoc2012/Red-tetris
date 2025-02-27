import React, { useState, useEffect } from "react";
import { pos$, rot$, key$, piece$ } from "../index.jsx";
import flyd from "flyd";
import { useGamepads } from "react-gamepads";
import { Square } from "./Square.jsx";
import { tetrominoes } from "../../server/tetrominoes.js";
import socket from "../socket.js";
import { board_to_block } from "../utils/utils.js";
import { move_down, move_left, move_right, rotate_piece } from "../utils/move_piece.js";
import { useDispatch, useSelector } from "react-redux";
import { useGameLoop } from "../game_loop.js";

export const Board = () => {
  const [grid, setGrid] = useState(
    Array.from({ length: 20 * 10 }).map((_, index) => (
      <Square key={index} name='cell empty'></Square>
    ))
  );
  const dispatch = useDispatch();
  const board = useSelector((state) => state.game_state.board);
  useGameLoop();

  useEffect(() => {
    socket.emit("new_room");

    return () => {};
  }, []);

  useEffect(() => {
    const subscription = flyd.map((key) => {
      if (!piece$()) {
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
        default:
          break;
      }
      console.log(key);
    }, key$);
    const subscription1 = flyd.combine(
      (pos$, rot$, piece$) => {
        setGrid(
          Array.from({ length: 20 * 10 }).map((_, i) => {
            const row = Math.floor(i / 10);
            const col = (i + 10) % 10;
            const [block_col, block_row] = board_to_block(pos$(), col, row);
            const isBlocked = false;

            if (
              piece$() &&
              block_row >= 0 &&
              block_row <= tetrominoes[piece$()][rot$()].length - 1 &&
              block_col >= 0 &&
              block_col <= tetrominoes[piece$()][rot$()][0].length - 1 &&
              tetrominoes[piece$()][rot$()][block_row][(block_col + 10) % 10] == 1
            ) {
              return (
                <Square key={i} color={piece$()} filled={true} blocked={isBlocked}></Square>
              );
            }
            return (
              <Square
                key={i}
                color={board[i]}
                filled={board[i] != ""}
                blocked={isBlocked}
              ></Square>
            );
          })
        );
      },
      [pos$, rot$, piece$]
    );

    return () => {
      subscription.end(true);
      subscription1.end(true);
    };
  }, [dispatch, board]);

  // Gamepad logic
  const [gamepads, setGamepads] = useState({});
  useGamepads((gamepads) => setGamepads(gamepads));

  useEffect(() => {
    if (gamepads[0] !== undefined) {
      gamepads[0].buttons.forEach((button, index) => {
        if (button.pressed) {
          console.log("Button pressed:", index);
        }
      });
      gamepads[0].axes.forEach((value, index) => {
        if (value !== 0) {
          if (index === 0) {
            if (value === -1) {
              console.log("Left pressed");
            } else if (value === 1) {
              console.log("Right pressed");
            }
          } else if (index === 1) {
            if (value === -1) {
              console.log("Up pressed");
            } else if (value === 1) {
              console.log("Down pressed");
            }
          }
        }
      });
    }
  }, [gamepads[0]]);

  return <div className='board'>{grid}</div>;
};
