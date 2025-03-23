import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initSocket } from "../socket.js";
import { Lobby } from "./Lobby.jsx";
import { Game } from "./Game.jsx";
import { Routes, Route, useNavigate } from "react-router";

const NotFound = () => {
  <div>
    <h2>Page Not Found</h2>
    <p>
      The page you're looking for doesn't exist. Go back to the <Link to="/">home page</Link>.
    </p>
  </div>
};

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    initSocket(dispatch);
  }, [dispatch]);

  useEffect(() => {}, []);

  return (
    <Routes>
      <Route path='/' element={<Lobby />} />
      <Route path='/:roomid/:name' element={<Game />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

export default App;
