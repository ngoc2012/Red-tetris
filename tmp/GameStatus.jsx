import { useEffect } from "react";
import socket from "../socket.js";
import { useSelector } from "react-redux";
import { fall_count$, lock_count$ } from "../streams.js";
import { Status } from "../../common/enums.js";

export const useGameStatus = () => {

  const status = useSelector((state) => state.game_state.status);
  
  useEffect(() => {
    if (status === "game_over") {
      console.log("Game Over");
      socket.emit("game_over", roomid);
    }
    if (status === Status.PLAYING) {
      fall_count$(0);
      lock_count$(0);
      frameRef.current = requestAnimationFrame(drawFrame);
    } else if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  }, [status]);

};
