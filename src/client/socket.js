import { io } from "socket.io-client";
import { add_piece } from "./store.js"; // Import Redux action


const socket = io("http://localhost:3004"); // Server URL

export const initSocket = (dispatch) => {
  socket.on("new_piece", (new_piece) => {
    dispatch(add_piece(new_piece)); // Dispatch to Redux store
  });
};

// export const sendMessage = (message) => {
//   socket.emit("sendMessage", message);
// };

export default socket;