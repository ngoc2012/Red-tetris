import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { pos$, rot$ } from "../index.jsx";
import { can_move, place_piece } from "../utils/move_piece.js";
import { DOWN, WIDTH, tetrisGravityFrames, LOCK } from "../../common/constants.js";
import { Status, PieceState } from "../../common/enums.js";
import { state$, fall_count$, lock_count$ } from "../index.jsx";
import { store } from "../store.js";


export const useGameLoop = () => {
  console.log("GameLoop mounted");
  const status = useSelector((state) => state.game_state.status);
  const frameRef = useRef();
  
  let lastFrameTime = performance.now();
  let cancelled = false;

  const drawFrame = (now) => {
    if (cancelled) return;
    if (store.getState().game_state.status !== Status.PLAYING) {
      cancelAnimationFrame(frameRef.current);
      return;
    }
    if (now - lastFrameTime >= 1000) {
      lastFrameTime = now;


      console.log("drawFrame", state$());
      if (state$() === PieceState.LOCKED) {
        lock_count$(lock_count$() + 1);
        console.log("lock_count", lock_count$());
        if (lock_count$() === LOCK) {
          lock_count$(0);
          fall_count$(0);
          state$(PieceState.FALLING);
          place_piece()
        }
      }
        
      if (state$() === PieceState.FALLING) {
        fall_count$(fall_count$() + 1);
        console.log("fall_count", fall_count$());
        const frames = tetrisGravityFrames[store.getState().game_state.level];
        if (fall_count$() === frames) {
          if (can_move(pos$() + WIDTH, DOWN, rot$())) {
            fall_count$(0);
            pos$(pos$() + WIDTH);
          } else {
            state$(PieceState.LOCKED);
            console.log("LOCKED");
            lock_count$(0);
          }
        }
      }
    }
    frameRef.current = requestAnimationFrame(drawFrame);
    
  };

  useEffect(() => {
    return () => {
      console.log("GameLoop unmounted");
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status === "game_over") {
      console.log("Game Over");
      socket.emit("game_over", roomid);
    }
    if (status === Status.PLAYING) {
      fall_count$(0);
      lock_count$(0);
      frameRef.current = requestAnimationFrame(drawFrame);
    } else if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  }, [status]);
};
