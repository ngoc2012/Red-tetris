import { store } from '../store';
import React, { useState, useEffect} from 'react';
import { Spectrums } from './Spectrums.jsx'
import { key$ } from '../index.jsx'
import flyd from 'flyd'
import { game_loop } from '../game_loop.js';

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
  const [status, setStatus] = useState("");

  useEffect(() => {
    const subscription = flyd.map((key) => {
      setStatus(key);
    }, key$);
  
    return () => {
      subscription.end(true);
    };
  }, []);
  
  const start_game = () => {
    console.log("start game");
  }

  return (
    <div className="info">
      <div className="next_pieces">
        {Array.from({ length: 3 }).map((_, index) => (
          <SmallBoard key={index} />
        ))}
      </div>
      <div title="score" className="score">1024</div>
      <Spectrums />
      <div title="status" className="status">{status}</div>
      <button className="button start_game" onClick={start_game}>Start game</button>
      <button className="button exit_game">Exit game</button>
      {/* <button className="button join_game">Join game</button> */}
      
    </div>
  )
}