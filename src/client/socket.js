import { io } from "socket.io-client";
import { setId, setStatus, setRoomId } from "./store.js";
import { next_pieces$ } from "./index.jsx";


const socket = io("http://localhost:3004"); // Server URL

export const initSocket = (dispatch) => {
  socket.on("next_piece", (new_piece) => {
    console.log("New piece received: ", new_piece);
    next_pieces$(next_pieces$().concat(new_piece));
  });
  
  socket.on("connected", ({id}) => {
    console.log("Now connected to server with id: ", id);
    dispatch(setStatus("connected"));
    dispatch(setId(id));
  });

  socket.on("new_room", ({room_id}) => {
    console.log("New room created: ", room_id);
    dispatch(setRoomId(room_id));
    dispatch(setStatus("Room id " + room_id));
  });
};

// export const sendMessage = (message) => {
//   socket.emit("sendMessage", message);
// };

export default socket;