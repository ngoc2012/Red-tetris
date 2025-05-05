import React, { useState, useEffect } from "react";
import { pos$, rot$, key$, piece$ } from "../index.jsx";
import { useGamepad } from "./GamePad.jsx";
import { Square } from "./Square.jsx";
import flyd from "flyd";
import {
  add_penalty,
  board_to_block,
  board_to_spectrum,
  can_move,
} from "../utils/utils.js";
import {
  move_down,
  // move_down_max,
  // move_left,
  // move_right,
  // rotate_piece,
} from "../utils/move_piece.js";
import { useDispatch, useSelector } from "react-redux";
import { useGameLoop } from "../game_loop.js";
import socket from "../socket.js";
import { setBoard } from "../store.js";
import { BUFFER, DOWN, LENGTH, WIDTH } from "../../common/constants.js";
import { Mode, Status } from "../../common/enums.js";
import { useKeyboard } from "./Keyboard.jsx";
import { tetrominoes } from "../../common/tetrominoes.js";

export const Board = () => {
  const [grid, setGrid] = useState(
    Array.from({ length: WIDTH * (LENGTH + BUFFER) }).map((_, index) => (
      <Square key={index} name='cell empty'></Square>
    ))
  );

  const [lock, setLock] = useState(0);
  const dispatch = useDispatch();
  const board = useSelector((state) => state.game_state.board);
  const mode = useSelector((state) => state.game_state.mode);
  const status = useSelector((state) => state.game_state.status);
  useGameLoop();
  useGamepad();
  useKeyboard();

  const handle_penalty = (rows) => {
    if (rows > 0 && status === "playing") {
      console.log("penalty", rows);
      dispatch(setBoard(add_penalty(board, rows)));
    }
  };

  const game_loop = () => {
    if (status !== Status.PLAYING) return;
    if (can_move(board, pos$() + WIDTH, DOWN, rot$())) {
      move_down(board, dispatch);
    } else {
      if (lock === 0) {
        setLock(
          setTimeout(() => {
            setLock(0);
            move_down(board, dispatch);
          }, 500)
        );
      }
    }
  };

  useEffect(() => {
    socket.on("penalty", handle_penalty);
    const subscription1 = flyd.combine(
      (pos$, rot$, piece$) => {
        setGrid(
          Array.from({ length: WIDTH * (LENGTH + BUFFER) }).map((_, i) => {
            const row = Math.floor(i / WIDTH);
            const col = (i + WIDTH) % WIDTH;
            const [block_col, block_row] = board_to_block(pos$(), col, row);

            if (
              piece$() &&
              block_row >= 0 &&
              block_row <= tetrominoes[piece$()][rot$()].length - 1 &&
              block_col >= 0 &&
              block_col <= tetrominoes[piece$()][rot$()][0].length - 1 &&
              tetrominoes[piece$()][rot$()][block_row][
                (block_col + WIDTH) % WIDTH
              ] == 1
            ) {
              return (
                <Square
                  key={i}
                  color={piece$()}
                  filled={true}
                  blocked={false}
                ></Square>
              );
            }
            return (
              <Square
                key={i}
                color={board[i]}
                filled={board[i] !== "" && mode !== Mode.INVIS}
                blocked={board[i] === "X"}
              ></Square>
            );
          })
        );
      },
      [pos$, rot$, piece$]
    );
    socket.emit("board_update", board_to_spectrum(board));

    return () => {
      subscription1.end(true);
      socket.off("penalty", handle_penalty);
    };
  }, [dispatch, board]);

  useEffect(() => {
    if (status === Status.PLAYING) {
      socket.on("game_loop", game_loop);
    }
    return () => {
      socket.off("game_loop", game_loop);
    };
  }, [status, dispatch, board, lock]);

  return <div className='board'>{grid.slice(BUFFER * WIDTH)}</div>;
};
