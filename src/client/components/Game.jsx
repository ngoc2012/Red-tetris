import React, { useEffect, useState } from "react";
import socket from "../socket";
import { useSelector } from "react-redux";
import { Board } from "./Board.jsx";
import { Info } from "./Info.jsx";
import { useNavigate } from "react-router";

export const Game = () => {
  const [display, setDisplay] = useState(false);
  const room_id = useSelector((state) => state.game_state.room_id);

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
  }, []);
  if (display)
    return (
      <div className='main'>
        <Board />
        <Info />
      </div>
    );
};
