import React, { useEffect, useState } from "react";
import socket from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { Board } from "./Board.jsx";
import { Info } from "./Info.jsx";
import { setRoomId, setStatus } from "../store.js";
import { reset } from "../utils/utils.js";
import { useParams } from "react-router-dom";

export const Game = () => {

  const { roomid, name } = useParams();
  const [display, setDisplay] = useState(false);
  const [status, setStatus0] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    setStatus0(`Search for the room ${roomid}... `);
    socket.emit("join_room", roomid, (response) => {
      if (response.success) {
        setDisplay(true);
        dispatch(setRoomId(roomid));
      }
      else {
        setStatus0("Room not found");
      }
    });
    return () => socket.emit("leave_room", roomid);
  }, [roomid, name]);

  return (
    display ? (
      <div className='main'>
        <Board />
        <Info />
      </div>
    ) : (<div>{status}</div>)
  );
};
