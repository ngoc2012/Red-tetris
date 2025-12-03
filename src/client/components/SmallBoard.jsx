// src/client/components/SmallBoard.jsx
import { tetrominoes } from "../../common/tetrominoes.js";


export const SmallBoard = ({ tetro }) => {
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