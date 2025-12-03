// src/client/components/Pieces.jsx
import { useFlyd } from "../useFlyd.js";
import { SmallBoard } from "./SmallBoard.jsx";
import { next_pieces$ } from "../streams/next_pieces$.js";

export const Pieces = () => {
  const pieces = useFlyd(next_pieces$);

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