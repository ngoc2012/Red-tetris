import React, { useState, useEffect, useRef } from "react";
import flyd from "flyd";
import { pos$, rot$, piece$ } from "../streams.js";
import { board_to_spectrum } from "../utils/utils.js";
import { useSelector } from "react-redux";
import socket from "../socket.js";
import { Grid } from "./Grid.jsx";

export const Board = () => {

  const board = useSelector((state) => state.game_state.board);
  const gamemode = useSelector((state) => state.game_state.gamemode);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    const subscription = flyd.combine(() => {
      setRenderKey((prev) => prev + 1);
    }, [pos$, rot$, piece$]);
    return () => {
      subscription.end(true);
    };
  }, []);

  useEffect(() => {
    socket.emit("board_update", board_to_spectrum());
  }, [board]);

  return (
    <div className="board">
      <Grid
        key={renderKey}
        board={board}
        gamemode={gamemode}
        pos={pos$()}
        rot={rot$()}
        piece={piece$()}
      />
    </div>
  );
};
