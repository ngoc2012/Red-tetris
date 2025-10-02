import { io } from "socket.io-client";
import { setScore, setId } from "./store.js";

// const socket = io(window.location.origin); // Server URL
// const socket = io("http://localhost:3004"); // Server URL
const socket = io(`${window.location.protocol}//${window.location.hostname}:3004`);


export const initSocket = (dispatch) => {
  socket.on("connected", ({ id }) => {
    console.log("Now connected to server with id: ", id);
    dispatch(setId(id));
  });

  socket.on("score_update", ({ id, score }) => {
    if (id === socket.id) {
      dispatch(setScore(score));
    }
  });
};

export default socket;
