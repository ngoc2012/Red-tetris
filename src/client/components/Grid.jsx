import React from "react";
import { Square } from "./Square.jsx";
import { WIDTH, LENGTH, BUFFER } from "../../common/constants.js";

export const Grid = ({ board, gamemode, piece, pos, rot, tetrominoes, board_to_block, Gamemode }) => {
  const gridSquares = Array.from({ length: WIDTH * (LENGTH + BUFFER) }).map((_, i) => {
    const row = Math.floor(i / WIDTH);
    const col = (i + WIDTH) % WIDTH;
    const [block_col, block_row] = board_to_block(pos, col, row);

    const isPieceBlock =
      piece &&
      block_row >= 0 &&
      block_row <= tetrominoes[piece][rot].length - 1 &&
      block_col >= 0 &&
      block_col <= tetrominoes[piece][rot][0].length - 1 &&
      tetrominoes[piece][rot][block_row][(block_col + WIDTH) % WIDTH] === 1;

    return isPieceBlock ? (
      <Square key={i} color={piece} filled={true} blocked={false} />
    ) : (
      <Square
        key={i}
        color={board[i]}
        filled={board[i] !== "" && gamemode !== Gamemode.INVIS}
        blocked={board[i] === "X"}
      />
    );
  });

  return <>{gridSquares.slice(BUFFER * WIDTH)}</>;
};
