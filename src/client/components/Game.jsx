import React, { useEffect, useState } from "react";
import socket from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { Board } from "./Board.jsx";
import { Info } from "./Info.jsx";
import { setRoomId, setStatus } from "../store.js";
import { add_next_piece, reset } from "../utils/utils.js";
import { useParams } from "react-router-dom";
import { NotFound } from "./NotFound.jsx";
import { next_pieces$, rot$ } from "../index.jsx";

export const Game = () => {
  const { roomid, name } = useParams();
  const [display, setDisplay] = useState(null);
  const dispatch = useDispatch();
  const status = useSelector((state) => state.game_state.status);

  const game_prep = () => {
    reset(dispatch);
    dispatch(setStatus("starting"));
  };

  const game_start = () => {
    rot$(0);
    dispatch(setStatus("playing"));
  };

  const game_over = () => {};

  const game_win = () => {
    console.log("GG");
    dispatch(setStatus("game_win"));
  };

  const next_piece = (new_piece) => {
    if (status !== "playing" && status !== "starting") {
      return;
    }
    console.log("New piece received: ", new_piece);
    next_pieces$(next_pieces$().concat(new_piece));
    add_next_piece();
  };

  useEffect(() => {
    socket.emit("join_room", roomid, (response) => {
      if (response.success) {
        setDisplay(true);
        dispatch(setRoomId(roomid));
        dispatch(setStatus("waiting"));
      } else {
        setDisplay(false);
      }
    });
    return () => {
      reset(dispatch);
      socket.emit("leave_room", roomid);
    };
  }, [roomid, name]);

  useEffect(() => {
    if (status === "game_over") {
      console.log("Game Over");
      socket.emit("game_over", roomid);
    }
    socket.on("game_prep", game_prep);
    socket.on("game_start", game_start);
    socket.on("game_over", game_over);
    socket.on("game_win", game_win);
    socket.on("next_piece", next_piece);

    return () => {
      socket.off("game_prep", game_prep);
      socket.off("game_start", game_start);
      socket.off("game_over", game_over);
      socket.off("game_win", game_win);
      socket.off("next_piece", next_piece);
    };
  }, [status]);

  if (display === null) {
    return;
  }

  return display ? (
    <div className='main'>
      <Board />
      <Info />
    </div>
  ) : (
    <NotFound />
  );
};
