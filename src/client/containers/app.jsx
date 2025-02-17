import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { initSocket, sendMessage } from "../socket.js";
import { Board } from '../components/Board.jsx'
import { Info } from '../components/Info.jsx';

const App = () => {
  const dispatch = useDispatch();
  // const messages = useSelector((state) => state.chat.messages);
  // const [message, setMessage] = React.useState("");

  useEffect(() => {
    initSocket(dispatch);
  }, [dispatch]);
  
  // const handleSend = () => {
  //   if (message.trim()) {
  //     sendMessage(message);
  //     setMessage(""); // Clear input
  //   }
  // };

  return (
    <div className="main">
      <Board />
      <Info />
    </div>
  )
}

export default App


