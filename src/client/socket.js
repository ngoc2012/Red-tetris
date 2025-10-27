import { io } from "socket.io-client";
import { setScore, setId } from "./store.js";


let socket = io(`${window.location.protocol}//${window.location.hostname}` + (window.location.port ? `:${window.location.port}` : ''), {
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
