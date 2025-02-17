import React from 'react';

export const Board = () => {
  return (
    <div className="board">
      {Array.from({ length: 20 * 10 }).map((_, index) => (
        <div key={index} className="cell empty"></div>
      ))}
    </div>
  )
}