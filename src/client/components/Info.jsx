import { resetBoard, setStatus } from "../store";
import { useSelector, useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import { Spectrums } from "./Spectrums.jsx";
import flyd from "flyd";
import { next_pieces$ } from "../index.jsx";
import { tetrominoes } from "../../server/tetrominoes.js";

const SmallBoard = ({ tetro }) => {
  return (
    <div className='small_board'>
      {Array.from({ length: 2 * 4 }).map((_, i) => {
        if (tetro === "") {
          return <div key={i} className='cell empty'></div>;
        }
        const row = Math.floor(i / 4);
        const col = i % 4;
        if (tetrominoes[tetro][0][row][col] === 1)
          return <div key={i} className={"cell filled " + tetro}></div>;
        else return <div key={i} className='cell empty'></div>;
      })}
    </div>
  );
};

const Pieces = () => {
  let [pieces, setPieces] = useState([]);

  useEffect(() => {
    const subscription = flyd.map((next_pieces) => {
      setPieces(next_pieces);
    }, next_pieces$);

    return () => {
      subscription.end(true);
    };
  }, []);

  return (
    <div className='next_pieces'>
      {Array.from({ length: 3 }).map((_, index) => {
        if (index < pieces.length) {
          return <SmallBoard key={index} tetro={pieces[index]} />;
        } else {
          return <SmallBoard key={index} tetro='' />;
        }
      })}
    </div>
  );
};

export const Info = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.game_state.status);
  const score = useSelector((state) => state.game_state.score);

  const start_game = () => {
    console.log("start game");
    dispatch(setStatus("playing"));
    dispatch(resetBoard());
    document.activeElement.blur();
  };

  const end_game = () => {
    console.log("end game");
    dispatch(setStatus("game_over"));
  };

  return (
    <div className='info'>
      <Pieces />
      <div className='game_info'>
        <div title='score' className='score'>
          {score}
        </div>
        <div title='status' className='status'>
          {status}
        </div>
        <button className='button start_game' onClick={start_game}>
          Start game
        </button>
        <button className='button exit_game' onClick={end_game}>
          End game
        </button>
      </div>
      <Spectrums />
      {/* <button className="button join_game">Join game</button> */}
    </div>
  );
};
