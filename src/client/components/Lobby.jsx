// https://reactrouter.com/start/framework/navigating#link
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setName } from "../store";
import socket from "../socket.js";

export const Lobby = () => {
  const dispatch = useDispatch();
  const name = useSelector((state) => state.player.name);

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [onError, setOnError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isFading, setIsFading] = useState(false);

  const getRooms = () => {
    socket.emit("room_list", (response) => {
      setRooms(response);
    });
  };
  const room_update = () => {
    getRooms();
  };

  const [rooms, setRooms] = useState([]);

  const nav = useNavigate();

  useEffect(() => {
    socket.on("room_update", room_update);
    getRooms();

    return () => {
      socket.off("room_update", room_update);
    };
  }, []);

  useEffect(() => {
    console.log("rooms", rooms);
    return () => {};
  }, [rooms]);

  const new_room = () => {
    socket.emit("new_room", (response) => {
      if (response.success) nav(`${response.room_id}/${name}`);
    });
  };

  const history = () => {};

  const handleNameClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e) => {
    setTempName(e.target.value);
  };

  const handleNameSubmit = (e) => {
    if (e.type === "blur" || (e.type === "keydown" && e.key === "Enter")) {
      socket.emit("rename", { new_name: tempName }, (response) => {
        if (response.success) {
          dispatch(setName(tempName));
          setIsEditing(false);
        } else {
          // console.error("Rename failed:", response.message);
          setOnError(true);
          setErrorMsg(response.message);
          setTempName(name);
          setIsEditing(false);
          setTimeout(() => {
            setIsFading(true);
            setTimeout(() => {
              setOnError(false);
              setIsFading(false);
              setErrorMsg("");
            }, 1000);
          }, 2000);
        }
      });
    }
    if (e.type === "keydown" && e.key === "Escape") {
      setTempName(name); // Reset to original name
      setIsEditing(false);
    }
  };
  return (
    <div className='lobby'>
      <div className='name_edit'>
        {isEditing ? (
          <input
            type='text'
            value={tempName}
            onChange={handleNameChange}
            onKeyDown={handleNameSubmit}
            onBlur={handleNameSubmit}
            autoFocus
          />
        ) : (
          <div className='name' onClick={handleNameClick}>
            Hi {name}!
          </div>
        )}
      </div>
      {onError && (
        <div className={`error ${isFading ? "fade-out" : ""}`}>{errorMsg}</div>
      )}
      <div className='rooms'>
        {rooms.map((r, i) =>
          r.status == "waiting" ? (
            <Link key={i} to={`/${r.id}/${name}`} className='waiting'>
              {r.id}
            </Link>
          ) : (
            <Link
              key={i}
              to={`/${r.id}/${name}`}
              onClick={(e) => {
                e.preventDefault();
              }}
              className='playing'
            >
              {r.id}
            </Link>
          )
        )}
      </div>
      <button className='button new_room' onClick={new_room}>
        New room
      </button>
      <button className='button history' onClick={history}>
        History
      </button>
    </div>
  );
};
