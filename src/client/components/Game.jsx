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
import { useGameLoop } from "./GameLoop.jsx";
import { useGamepad } from "./GamePad.jsx";
import { useKeyboard } from "./Keyboard.jsx";
import { store } from "../store.js";


export const Game = () => {

  console.log("Game rendered");

  const { roomid, name } = useParams();
  const [found, setFound] = useState(false);
  const [loading, setLoading] = useState(true);
  useGameConnect();
  useGamepad();
  useKeyboard();
  useGameLoop();

  useEffect(() => {
    socket.emit("join_room", roomid, (response) => {
      if (response.success) {
        setFound(true);
        store.dispatch(setRoomId(roomid));
        store.dispatch(setStatus(response.room.status));
        store.dispatch(setGamemode(response.room.gamemode));
        store.dispatch(setMode(response.room.mode));
        store.dispatch(setLevel(response.room.level));
      } else {
        setFound(false);
      }
      setLoading(false);
    });
    return () => {
      reset();
      socket.emit("leave_room", roomid);
    };
  }, [roomid, name]);

  useEffect(() => {
    return () => {
      console.log("Game unmounted");
    };
  }, []);

  return loading ? <h1>Loading</h1> : (found ? (
    <div className='main'>
      <Board />
      <Info />
    </div>
  ) : (<NotFound />));
};
