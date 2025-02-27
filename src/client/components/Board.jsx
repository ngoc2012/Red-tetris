import { setBoard } from "../store";
import React, { useState, useEffect } from "react";
import { pos$, rot$, key$, piece$ } from "../index.jsx";
import flyd from "flyd";
import { useGamepads } from "react-gamepads";
import { Square } from "./Square.jsx";
import { tetrominoes } from "../../server/tetrominoes.js";
import socket from "../socket.js";
import { add_block, board_to_block, can_move, next_rot } from "../../utils/utils.js";
import { useDispatch, useSelector } from "react-redux";

export const RIGHT = 1;
export const LEFT = 2;
export const DOWN = 4;
export const ROT = 8;

export const Board = () => {
  const [grid, setGrid] = useState(
    Array.from({ length: 20 * 10 }).map((_, index) => (
      <Square key={index} name='cell empty'></Square>
    ))
  );

  const dispatch = useDispatch();
  const board = useSelector((state) => state.game_state.board);

  useEffect(() => {
    socket.emit("new_room");

    return () => {};
  }, []);

  useEffect(() => {
    const subscription = flyd.map((key) => {
      // Key pressed logic here
      switch (key) {
        case "ArrowRight":
          if (can_move(board, pos$() + 1, RIGHT, rot$())) {
            pos$(pos$() + 1);
          }
          break;
        case "ArrowLeft":
          if (can_move(board, pos$() - 1, LEFT, rot$())) {
            pos$(pos$() - 1);
          }
          break;
        case "ArrowDown":
          if (can_move(board, pos$() + 10, DOWN, rot$())) {
            pos$(pos$() + 10);
          } else {
            dispatch(setBoard(add_block(board)));
            pos$(0);
            rot$(0);
            key$("");
          }
          break;
        case "ArrowUp":
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
          break;
        default:
          break;
      }
      console.log(key);
    }, key$);
    const subscription1 = flyd.combine(
      (pos$, rot$) => {
        setGrid(
          Array.from({ length: 20 * 10 }).map((_, i) => {
            const row = Math.floor(i / 10);
            const col = (i + 10) % 10;
            const [block_col, block_row] = board_to_block(pos$(), col, row);
            const isBlocked = false;

            if (
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
      [pos$, rot$]
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

  // perhaps use a 2d array to handle line clearing
  // const grid = ;

  return <div className='board'>{grid}</div>;
};
