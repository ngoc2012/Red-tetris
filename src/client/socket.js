import { io } from "socket.io-client";
import { setScore, setId } from "./store.js";

let socket = null;
if (import.meta.env.VITE_ENV === "production") {
    socket = io(`${window.location.protocol}//${window.location.hostname}`, {
    path: '/ws/red/socket.io',
    transports: ['websocket']
  });
} else {
    socket = io(`${window.location.protocol}//${window.location.hostname}:3004`, {
    path: '/ws/red/socket.io',
    transports: ['websocket']
  });
}




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
