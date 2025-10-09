import { io } from "socket.io-client";
import { setScore, setId } from "./store.js";

let link = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
let socket = null;
if (import.meta.env.VITE_ENV === "production") {
    link =`${window.location.protocol}//${window.location.hostname}`;
}

socket = io(link, {
  path: '/ws/red/socket.io',
  transports: ['websocket']
});




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
