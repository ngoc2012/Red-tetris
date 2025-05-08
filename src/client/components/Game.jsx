import React, { useEffect, useState } from "react";
import socket from "../socket";
import { useDispatch } from "react-redux";
import { Board } from "./Board.jsx";
import { Info } from "./Info.jsx";
import { setGamemode, setLevel, setMode, setRoomId, setStatus } from "../store.js";
import { reset } from "../utils/utils.js";
import { useParams } from "react-router-dom";
import { NotFound } from "./NotFound.jsx";
import { useGameConnect } from "./GameConnect.jsx";
import { useGameLoop } from "../game_loop.js";
import { useGameStatus } from "./GameStatus.jsx";

export const Game = () => {

  console.log("Game rendered");

  const { roomid, name } = useParams();
  const [display, setDisplay] = useState(null);
  const dispatch = useDispatch();
  useGameStatus();
  useGameConnect();
  useGamepad();
  useKeyboard();
  useGameLoop();

  useEffect(() => {
    socket.emit("join_room", roomid, (response) => {
      if (response.success) {
        setDisplay(true);
        dispatch(setRoomId(roomid));
        dispatch(setStatus(response.room.status));
        dispatch(setGamemode(response.room.gamemode));
        dispatch(setMode(response.room.mode));
        dispatch(setLevel(response.room.level));
      } else {
        setDisplay(false);
      }
    });
    return () => {
      reset(dispatch);
      socket.emit("leave_room", roomid);
    };
  }, [roomid, name]);

  if (display === null) {
    return;
  }

  return display ? (
    <div className='main'>
      <Board />
      <Info />
    </div>
  ) : (<NotFound />);
};
