import { useEffect, useRef } from "react";
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
  const score = useSelector((state) => state.game_state.score);
  const requestRef = useRef();
  const lastUpdateTimeRef = useRef(0);
  const progressTimeRef = useRef(0);

  const update = (time) => {
    requestRef.current = requestAnimationFrame(update);
    if (status !== "playing") {
      return;
    }
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = time;
    }
    const deltaTime = time - lastUpdateTimeRef.current;
    progressTimeRef.current += deltaTime;
    if (progressTimeRef.current > 1000) {
      console.log("Game loop");
      move_down(board, score, dispatch);
      progressTimeRef.current = 0;
    }
    lastUpdateTimeRef.current = time;
  };

  useEffect(() => {
    if (status !== "playing") {
      return () => {};
    }
    requestRef.current = requestAnimationFrame(update);
    document.addEventListener("keydown", onKeyDown);
    for (let i = next_pieces$().length; i < 3 + !piece$(); i++)
      socket.emit("next_piece", { room_id });

    return () => {
      cancelAnimationFrame(requestRef.current);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [status, board, dispatch]);
};
