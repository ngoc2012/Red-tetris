import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { key$, piece$ } from "./index.jsx";
import { move_down } from "./utils/move_piece.js";

const onKeyDown = (event) => {
  key$(event.key);
};

export const useGameLoop = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.game_state.status);
  const board = useSelector((state) => state.game_state.board);
  const requestRef = useRef();
  const lastUpdateTimeRef = useRef(0);
  const progressTimeRef = useRef(0);
  const level = 6;

  const update = (time) => {
    requestRef.current = requestAnimationFrame(update);

    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = time;
    }
    const deltaTime = time - lastUpdateTimeRef.current;
    progressTimeRef.current += deltaTime;
    if (
      progressTimeRef.current >
      Math.pow(0.8 - (level - 1) * 0.007, level - 1) * 1000
    ) {
      console.log("Game loop");
      if (piece$()) {
        move_down(board, dispatch);
      }
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

    return () => {
      cancelAnimationFrame(requestRef.current);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [status, board, dispatch]);
};
