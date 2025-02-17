import { io } from "socket.io-client";
import { addMessage } from "./store.js"; // Import Redux action


const socket = io("http://localhost:3004"); // Server URL

export const initSocket = (dispatch) => {
  // socket.on("receiveMessage", (message) => {
  //   dispatch(addMessage(message)); // Dispatch to Redux store
  // });
};

// export const sendMessage = (message) => {
//   socket.emit("sendMessage", message);
// };

export default socket;