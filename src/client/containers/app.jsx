import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { initSocket, sendMessage } from "../actions/socket.js";

const App = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);
  const [message, setMessage] = React.useState("");

  useEffect(() => {
    initSocket(dispatch);
  }, [dispatch]);
  
  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage(""); // Clear input
    }
  };

  return (
    <div>
      <span>{message}</span>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  )
}

export default App


