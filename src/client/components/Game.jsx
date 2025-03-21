import React, { useEffect, useState } from "react";
import socket from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { Board } from "./Board.jsx";
import { Info } from "./Info.jsx";
import { useNavigate } from "react-router";
import { setRoomId, setStatus } from "../store.js";
import { reset } from "../utils/utils.js";

export const Game = () => {
  const [display, setDisplay] = useState(false);
  const room_id = useSelector((state) => state.game_state.room_id);
  const dispatch = useDispatch();

  const nav = useNavigate();

  useEffect(() => {
    // verify if room and player id exists
    socket.emit("ping", room_id, (response) => {
      if (response.pong === false) {
        nav("/", { replace: true });
      } else if (response.pong === true) {
        setDisplay(true);
      }
    });
    reset(dispatch);
    dispatch(setStatus("waiting"));
    return () => {
      socket.emit("leave_room", room_id);
    };
  }, []);
  if (display)
    return (
      <div className='main'>
        <Board />
        <Info />
      </div>
    );
};
