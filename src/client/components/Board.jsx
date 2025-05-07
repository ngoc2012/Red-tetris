import React, { useState, useEffect, useRef } from "react";
import { pos$, rot$, key$, piece$ } from "../index.jsx";
import { useGamepad } from "./GamePad.jsx";
import { Square } from "./Square.jsx";
import flyd from "flyd";
import {
  // add_penalty,
  board_to_block,
  board_to_spectrum,
} from "../utils/utils.js";
import {
  can_move,
  place_piece,
  // move_down,
  // move_down_max,
  // move_left,
  // move_right,
  // rotate_piece,
} from "../utils/move_piece.js";
import { useDispatch, useSelector } from "react-redux";
// import { useGameLoop } from "../game_loop.js";
import socket from "../socket.js";
import { setBoard } from "../store.js";
import { BUFFER, DOWN, LENGTH, WIDTH, tetrisGravityFrames, LOCK } from "../../common/constants.js";
import { Mode, Status, PieceState } from "../../common/enums.js";
import { useKeyboard } from "./Keyboard.jsx";
import { tetrominoes } from "../../common/tetrominoes.js";
import { state$, fall_count$, lock_count$ } from "../index.jsx";


export const Board = () => {
  console.log("Board rendered");

  const [grid, setGrid] = useState(
    Array.from({ length: WIDTH * (LENGTH + BUFFER) }).map((_, index) => (
      <Square key={index} name='cell empty'></Square>
    ))
  );

  // const [lock, setLock] = useState(0);
  const dispatch = useDispatch();
  const board = useSelector((state) => state.game_state.board);
  // const mode = useSelector((state) => state.game_state.mode);
  const status = useSelector((state) => state.game_state.status);
  const level = useSelector((state) => state.game_state.level);
  const frameRef = useRef();
  useGamepad();
  useKeyboard();

  const drawFrame = () => {
    if (status !== Status.PLAYING) {
      cancelAnimationFrame(frameRef.current);
      return;
    }
    console.log("drawFrame", state$());
    if (state$() === PieceState.LOCKED) {
      lock_count$(lock_count$() + 1);
      console.log("lock_count", lock_count$());
      if (lock_count$() === LOCK) {
        lock_count$(0);
        fall_count$(0);
        state$(PieceState.FALLING);
        place_piece(board, dispatch)
      }
    }
      
    if (state$() === PieceState.FALLING) {
      fall_count$(fall_count$() + 1);
      console.log("fall_count", fall_count$());
      if (fall_count$() === tetrisGravityFrames[level]) {
        if (can_move(board, pos$() + WIDTH, DOWN, rot$())) {
          fall_count$(0);
          pos$(pos$() + WIDTH);
        } else {
          state$(PieceState.LOCKED);
          console.log("LOCKED");
          lock_count$(0);
        }
        // move_down(board, dispatch);
      }
    }

    setGrid(
      Array.from({ length: WIDTH * (LENGTH + BUFFER) }).map((_, i) => {
        const row = Math.floor(i / WIDTH);
        const col = (i + WIDTH) % WIDTH;
        const [block_col, block_row] = board_to_block(pos$(), col, row);

        // Draw the piece
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

    setTimeout(() => {
      frameRef.current = requestAnimationFrame(drawFrame);
    }, 100)
    
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log("board_update", status);
    if (status === Status.PLAYING)
      socket.emit("board_update", board_to_spectrum(board));
    return () => {};
  }, [board]);

  useEffect(() => {
    console.log("status", status);
    if (status === Status.PLAYING) {
      fall_count$(0);
      lock_count$(0);
      frameRef.current = requestAnimationFrame(drawFrame);
    } else if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    return () => {};
  }, [status]);

  return <div className='board'>{grid.slice(BUFFER * WIDTH)}</div>;
};
