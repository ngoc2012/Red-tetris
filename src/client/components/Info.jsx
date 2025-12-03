import { useSelector, useDispatch } from "react-redux";
import { Spectrums } from "./Spectrums.jsx";
import socket from "../socket.js";
import { Gamemode, Status } from "../../common/enums.js";
import { setStatus } from "../store.js";


export const Info = () => {  
  const dispatch = useDispatch();
  const status = useSelector((state) => state.game_state.status);
  const score = useSelector((state) => state.game_state.score);
  const room_id = useSelector((state) => state.game_state.room_id);
  const gamemode = useSelector((state) => state.game_state.gamemode);
  const level = useSelector((state) => state.game_state.level);

  const start_game = () => {
    socket.emit("game_start", room_id, (response) => {
      if (response.success) {
        console.log("game starting");
        dispatch(setStatus(Status.PLAYING));
      } else {
        console.log("could not start game");
      }
    });
  };

  const change_gamemode = (e) => {
    if (!Object.values(Gamemode).includes(e.target.value)) return;
    socket.emit("gamemode", e.target.value, room_id);
  };

  return (
    <div className='info'>
      <Pieces />
      <div className='game_info'>
        <div title='score' className='score'>
          {score} / {level}
        </div>
        <div title='status' className='status'>
          {status}
        </div>
        <button
          className='button start_game'
          onClick={start_game}
          disabled={status === "playing"}
        >
          Start game
        </button>
        <select
          className='mode'
          onChange={change_gamemode}
          value={gamemode}
        >
          {Object.entries(Gamemode).map(([key, value]) => (
          <option key={key} value={value}>
            {value}
          </option>
        ))}
      </select>
      </div>
      <Spectrums />
    </div>
  );
};
