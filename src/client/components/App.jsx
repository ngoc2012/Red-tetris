import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initSocket } from "../socket.js";
import { Lobby } from "./Lobby.jsx";
import { Game } from "./Game.jsx";
import { History } from "./History.jsx";
import { Routes, Route } from "react-router-dom";
import { NotFound } from "./NotFound.jsx";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    initSocket(dispatch);
  }, [dispatch]);

  return (
    <Routes>
      <Route path='/' element={<Lobby />} />
      <Route path='/:roomid/:name' element={<Game />} />
      <Route path='/history' element={<History />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

export default App;
