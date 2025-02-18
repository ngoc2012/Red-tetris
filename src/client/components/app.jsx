import React, { useEffect } from 'react'
import { useDispatch } from "react-redux";
import { initSocket } from "../socket.js";
import { Board } from './Board.jsx'
import { Info } from './Info.jsx';
import { Lobby } from './Lobby.jsx';
import { Routes, Route } from "react-router";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    initSocket(dispatch);
  }, [dispatch]);
  
  useEffect(() => {
  },[]);
  
  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/:roomid/:name" element={
        <div className="main">
        <Board />
        <Info />
        </div>} />
    </Routes>
  )
}

export default App


