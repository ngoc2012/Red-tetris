import { setStatus } from '../store';
import { useSelector, useDispatch } from 'react-redux';
import React from 'react';
import { Spectrums } from './Spectrums.jsx'
import { useGameLoop } from '../game_loop.js';

const SmallBoard = () => {
  return (
    <div className="small_board">
      {Array.from({ length: 2 * 4 }).map((_, index) => (
        <div key={index} className="cell empty"></div>
      ))}
    </div>
  )
}

export const Info = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.game_state.status);

  useGameLoop();

  const start_game = () => {
    console.log("start game");
    dispatch(setStatus("playing"));
  }

  const end_game = () => {
    console.log("end game");
    dispatch(setStatus("game_over"));
  }

  return (
    <div className="info">
      <div className="next_pieces">
        {Array.from({ length: 3 }).map((_, index) => (
          <SmallBoard key={index} />
        ))}
      </div>
      <div className='game_info'>
        <div title="score" className="score">1024</div>
        <div title="status" className="status">{status}</div>
        <button className="button start_game" onClick={start_game}>Start game</button>
        <button className="button exit_game" onClick={end_game}>End game</button>
      </div>
      <Spectrums />
      {/* <button className="button join_game">Join game</button> */}
      
    </div>
  )
}