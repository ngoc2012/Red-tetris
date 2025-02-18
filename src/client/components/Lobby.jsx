// https://reactrouter.com/start/framework/navigating#link
import React from 'react';
import { Link } from "react-router";
import { useSelector, useDispatch } from 'react-redux';
import { setStatus } from '../store';

export const Lobby = () => {

  const room_list = ["room1", "room2", "room3"];

  const new_room = () => {
    console.log("start game");
    dispatch(setStatus("playing"));
  }

  const history = () => {
    console.log("start game");
    dispatch(setStatus("playing"));
  }

  const player_name = useSelector((state) => state.player.name);

  return (
    <div className="lobby">
      {room_list.map((r, i) => (
        <div key={i} className="rooms">
          <Link to={`/${r}/${player_name}`}>{r}</Link>
        </div>
      ))}
      <button className="button new_room" onClick={new_room}>New room</button>
      <button className="button history" onClick={history}>History</button>
      
    </div>
  )
}