import React, { useEffect } from "react";
import { pos$, rot$, piece$ } from "../streams.js";
import { board_to_spectrum } from "../utils/utils.js";
import { useSelector } from "react-redux";
import socket from "../socket.js";
import { Grid } from "./Grid.jsx";
import { useFlyd } from "../useFlyd.js";

export const Board = () => {

  const board = useSelector((state) => state.game_state.board);
  const gamemode = useSelector((state) => state.game_state.gamemode);
  const pos = useFlyd(pos$);
  const rot = useFlyd(rot$);
  const piece = useFlyd(piece$);

  useEffect(() => {
    socket.emit("board_update", board_to_spectrum());
  }, [board]);

  return (
    <div className="board">
      <Grid
        board={board}
        gamemode={gamemode}
        pos={pos}
        rot={rot}
        piece={piece}
      />
    </div>
  );
};
