import { useEffect, useRef } from "react";
import { pos$, rot$ } from "../index.jsx";
import { can_move, place_piece } from "../utils/move_piece.js";
import { DOWN, WIDTH, tetrisGravityFrames, LOCK } from "../../common/constants.js";
import { Status, PieceState } from "../../common/enums.js";
import { state$, fall_count$, lock_count$ } from "../index.jsx";
import { store } from "../store.js";


export const useGameLoop = () => {
  const frameRef = useRef();
  

  const drawFrame = () => {
    if (store.getState().game_state.status !== Status.PLAYING) {
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
        place_piece()
      }
    }
      
    if (state$() === PieceState.FALLING) {
      fall_count$(fall_count$() + 1);
      console.log("fall_count", fall_count$());
      if (fall_count$() === tetrisGravityFrames[level]) {
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

    setTimeout(() => {
      frameRef.current = requestAnimationFrame(drawFrame);
    }, 1000)
    
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);
};
