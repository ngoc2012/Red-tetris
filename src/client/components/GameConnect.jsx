import { useEffect } from "react";
import socket from "../socket.js";
import { setGamemode, setLevel, setMode, setStatus } from "../store.js";
import { add_next_piece, reset } from "../utils/utils.js";
import { next_pieces$ } from "../index.jsx";
import { add_penalty } from "../utils/utils.js";
import { store } from "../store.js";


export const useGameConnect = () => {

  const game_prep = () => {
    reset();
    store.dispatch(setStatus("starting"));
  };

  const game_start = (room) => {
    // rot$(0);
    store.dispatch(setMode(room.mode));
    store.dispatch(setGamemode(room.gamemode));
    store.dispatch(setLevel(room.level));
    console.log("Game started", room.level);
    store.dispatch(setStatus("playing"));
  };

  const game_over = () => {};

  const game_win = () => {
    console.log("GG");
    store.dispatch(setStatus("game_win"));
  };

  const receive_next_piece = (new_piece) => {
    // console.log("Received new piece: ", new_piece, status);
    // if (status !== "playing" && status !== "starting") {
    //   return;
    // }
    console.log("New piece received: ", new_piece);
    next_pieces$(next_pieces$().concat(new_piece));
    add_next_piece();
  };

  useEffect(() => {
    socket.on("game_prep", game_prep);
    socket.on("game_start", game_start);
    socket.on("game_over", game_over);
    socket.on("game_win", game_win);
    socket.on("next_piece", receive_next_piece);
    socket.on("penalty", add_penalty);
    return () => {
      socket.off("game_prep", game_prep);
      socket.off("game_start", game_start);
      socket.off("game_over", game_over);
      socket.off("game_win", game_win);
      socket.off("next_piece", receive_next_piece);
      socket.off("penalty", add_penalty);
    };
  }, []);

};
