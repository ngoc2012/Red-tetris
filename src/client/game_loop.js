import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { key$, next_pieces$, piece$ } from "./index.jsx";
import socket from "./socket.js";
import { move_down } from "./utils/move_piece.js";

const onKeyDown = (event) => {
  key$(event.key);
};

export const useGameLoop = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.game_state.status);
  const room_id = useSelector((state) => state.game_state.room_id);
  const board = useSelector((state) => state.game_state.board);

  useEffect(() => {
    if (status === "playing") {
      document.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [status, dispatch]);

  useEffect(() => {
    if (status !== "playing") {
      return () => {};
    }
    for (let i = next_pieces$().length; i < 3 + !piece$(); i++)
      socket.emit("next_piece", { room_id });
    const intervalId = setInterval(() => {
      console.log("Game loop");
      move_down(board, dispatch);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [status, board, dispatch]);
};
