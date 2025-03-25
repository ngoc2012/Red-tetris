import React, { useEffect, useState } from "react";
import socket from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { Board } from "./Board.jsx";
import { Info } from "./Info.jsx";
import { setRoomId, setStatus } from "../store.js";
import { reset } from "../utils/utils.js";
import { useParams } from "react-router-dom";
import { NotFound } from "./NotFound.jsx";

export const Game = () => {
  const { roomid, name } = useParams();
  const [display, setDisplay] = useState(null);
  const dispatch = useDispatch();
  const status = useSelector((state) => state.game_state.status);

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

    return () => {};
  }, [status]);

  useEffect(() => {
    socket.on("game_start", () => {
      reset(dispatch);
      dispatch(setStatus("playing"));
    });

    socket.on("game_over", () => {});

    socket.on("game_win", () => {
      console.log("GG");
    });

    return () => {};
  }, []);

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
