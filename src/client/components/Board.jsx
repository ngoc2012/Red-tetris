import React, { useState, useEffect, useRef } from "react";
import flyd from "flyd";
import { pos$, rot$, piece$ } from "../index.jsx";
import { Square } from "./Square.jsx";
import { board_to_block, board_to_spectrum } from "../utils/utils.js";
import { useSelector } from "react-redux";
import socket from "../socket.js";
import { BUFFER, LENGTH, WIDTH } from "../../common/constants.js";
import { Gamemode } from "../../common/enums.js";
import { tetrominoes } from "../../common/tetrominoes.js";


export const Board = () => {

  const [grid, setGrid] = useState(
    Array.from({ length: WIDTH * (LENGTH + BUFFER) }).map((_, index) => (
      <Square key={index} name='cell empty'></Square>
    ))
  );
  const board = useSelector((state) => state.game_state.board);
  const gamemode = useSelector((state) => state.game_state.gamemode);

  const boardRef = useRef(board);
  const gamemodeRef = useRef(gamemode);

  const board_update = () => {
    // console.log("Board updated");
    const currentBoard = boardRef.current;
    const currentMode = gamemodeRef.current;

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
            color={currentBoard[i]}
            filled={currentBoard[i] !== "" 
              && gamemodeRef.current !== Gamemode.INVIS}
            blocked={currentBoard[i] === "X"}
          ></Square>
        );
      })
    );
  };

  useEffect(() => {
    const subscription = flyd.combine(() => {
      board_update();
    }, [pos$, rot$, piece$]);

    return () => {
      subscription.end(true);
    };
  }, []);


  useEffect(() => {
    boardRef.current = board;
    gamemodeRef.current = gamemode;
    board_update();
    return () => {};
  }, [board, gamemode]);

  useEffect(() => {
    socket.emit("board_update", board_to_spectrum());
  }, [board]);

  return <div className='board'>{grid.slice(BUFFER * WIDTH)}</div>;
};
