import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { key$ } from "./index.jsx";

const onKeyDown = (event) => {
  key$(event.key);
};

export const useGameLoop = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.game_state.status);
  const board = useSelector((state) => state.game_state.board);
  const requestRef = useRef();
  const lastUpdateTimeRef = useRef(0);
  // const progressTimeRef = useRef(0);

  const update = (time) => {
    requestRef.current = requestAnimationFrame(update);

    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = time;
    }
    // const deltaTime = time - lastUpdateTimeRef.current;
    // progressTimeRef.current += deltaTime;
    lastUpdateTimeRef.current = time;
  };

  useEffect(() => {
    if (status !== "playing") {
      return () => {};
    }
    requestRef.current = requestAnimationFrame(update);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [status, board, dispatch]);
};
