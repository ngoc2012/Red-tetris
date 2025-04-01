import { io } from "socket.io-client";
import { setScore, setId } from "./store.js";

const socket = io(window.location.origin); // Server URL

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
