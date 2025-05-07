import React, { useEffect, useState } from "react";
import socket from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { Board } from "./Board.jsx";
import { Info } from "./Info.jsx";
import { setGamemode, setLevel, setMode, setRoomId, setStatus } from "../store.js";
import { add_next_piece, reset } from "../utils/utils.js";
import { useParams } from "react-router-dom";
import { NotFound } from "./NotFound.jsx";
import { next_pieces$, rot$ } from "../index.jsx";
import { Status } from "../../common/enums.js";
import {
  add_penalty,
  // board_to_block,
  // board_to_spectrum,
  // can_move,
} from "../utils/utils.js";


export const Game = () => {

  console.log("Game rendered");

  const { roomid, name } = useParams();
  const [display, setDisplay] = useState(null);
  const dispatch = useDispatch();
  const status = useSelector((state) => state.game_state.status);
  const board = useSelector((state) => state.game_state.board);

  const game_prep = () => {
    reset(dispatch);
    dispatch(setStatus("starting"));
  };

  const game_start = (room) => {
    // rot$(0);
    dispatch(setMode(room.mode));
    dispatch(setGamemode(room.gamemode));
    dispatch(setLevel(room.level));
    console.log("Game started", room.level);
    dispatch(setStatus("playing"));
  };

  const game_over = () => {};

  const game_win = () => {
    console.log("GG");
    dispatch(setStatus("game_win"));
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

  const handle_penalty = (rows) => {
    if (rows > 0 && status === "playing") {
      console.log("penalty", rows);
      dispatch(setBoard(add_penalty(board, rows)));
    }
  };

  useEffect(() => {
    socket.emit("join_room", roomid, (response) => {
      if (response.success) {
        setDisplay(true);
        dispatch(setRoomId(roomid));
        dispatch(setStatus(response.room.status));
        dispatch(setGamemode(response.room.gamemode));
        dispatch(setMode(response.room.mode));
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
    socket.on("game_prep", game_prep);
    socket.on("game_start", game_start);
    socket.on("game_over", game_over);
    socket.on("game_win", game_win);
    socket.on("next_piece", receive_next_piece);
    socket.on("penalty", handle_penalty);
    return () => {
      socket.off("game_prep", game_prep);
      socket.off("game_start", game_start);
      socket.off("game_over", game_over);
      socket.off("game_win", game_win);
      socket.off("next_piece", receive_next_piece);
      socket.off("penalty", handle_penalty);
    };
  }, []);

  useEffect(() => {
    if (status === "game_over") {
      console.log("Game Over");
      socket.emit("game_over", roomid);
    }
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
