import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { pos$, rot$ } from "../streams.js";
import { can_move, place_piece,  init_new_piece, rotate_piece }
  from "../utils/move_piece.js";
import { DOWN, WIDTH, tetrisGravityFrames, LOCK, RIGHT, LEFT, ROT, FALL }
  from "../../common/constants.js";
import { Status, PieceState } from "../../common/enums.js";
import { keys$, state$, fall_count$, lock_count$ }
  from "../streams.js";
import { store } from "../store.js";
import socket from "../socket.js";
import { pollGamepads } from "../utils/gamepad.js";


const apply_key = () => {
  if (keys$().length > 0) {
    const key = keys$()[0];
    keys$(keys$().slice(1));
    switch (key) {
      case RIGHT:
        if (can_move(pos$() + 1, RIGHT, rot$()))
          pos$(pos$() + 1);
        break;
      case LEFT:
        if (can_move(pos$() - 1, LEFT, rot$()))
          pos$(pos$() - 1);
        break;
      case DOWN:
        if (can_move(pos$() + WIDTH, DOWN, rot$())) {
          state$(PieceState.FALLING);
          lock_count$(0);
          fall_count$(0);
          pos$(pos$() + WIDTH);
        } else
          place_piece();
        break;
      case ROT:
        rotate_piece();
        break;
      case FALL:
        let dist = 0;
        while (can_move(pos$() + WIDTH * dist, DOWN, rot$()))
          ++dist;
        pos$(pos$() + WIDTH * (dist - 1));
        place_piece();
        break;
      default:
        break;
    }
  }
};

const lock_state = () => {
  lock_count$(lock_count$() + 1);
  if (lock_count$() === LOCK) {
    lock_count$(0);
    if (can_move(pos$() + WIDTH, DOWN, rot$())) {
      fall_count$(0);
      pos$(pos$() + WIDTH);
      state$(PieceState.FALLING);
    } else place_piece();
  }
};

const falling_state = () => {
  fall_count$(fall_count$() + 1);
  const frames = tetrisGravityFrames[store.getState().game_state.level];
  if (fall_count$() === frames) {
    if (can_move(pos$() + WIDTH, DOWN, rot$())) {
      fall_count$(0);
      pos$(pos$() + WIDTH);
      if (!can_move(pos$() + WIDTH, DOWN, rot$())) {
        state$(PieceState.LOCKED);
        lock_count$(0);
      }
    } else
      place_piece();
  }
};

export const useGameLoop = () => {
  const status = useSelector((state) => state.game_state.status);
  const frameRef = useRef();
  const gamepadRef = useRef(-1);
  const lastGamepadInputTimeRef = useRef(performance.now());

  let lastFrameTime = performance.now();

  const drawFrame = (now) => {
    if (store.getState().game_state.status !== Status.PLAYING) {
      cancelAnimationFrame(frameRef.current);
      keys$([]);
      return;
    }
    pollGamepads(gamepadRef, now, lastGamepadInputTimeRef);
    apply_key();
    
    if (now - lastFrameTime >= 1) {
      lastFrameTime = now;
      if (state$() === PieceState.LOCKED) lock_state();
      if (state$() === PieceState.FALLING) falling_state();
    }
    frameRef.current = requestAnimationFrame(drawFrame);
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        keys$([]);
      }
    };
  }, []);

  useEffect(() => {
    if (status === "game_over")
      socket.emit("game_over", store.getState().game_state.room_id);
    if (status === Status.PLAYING) {
      init_new_piece();
      frameRef.current = requestAnimationFrame(drawFrame);
    } else if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      keys$([]);
    }
  }, [status]);
};
