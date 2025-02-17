import React from 'react'

export const Spectrum = ({info}) => {
  return (
    <div className="spectrum">
      <header>{info.playerId}</header>
      <div className="cells">
      {Array.from({ length: 20 * 10 }).map((_, i) => {
          const row = Math.floor(i / 10);
          const isBlocked = i < info.penalty;
          const isFilled = !isBlocked && info.spec[row] && i % 10 < info.spec[row];

          console.log(isBlocked, isFilled, info.spec[row], i % 10, info.spec[row]);

          return (
            <div
              key={i}
              className={`spec_cell ${isBlocked ? 'blocked' : isFilled ? 'filled' : 'empty'}`}
            />
          );
        })}
      </div>
      <footer>{info.score}</footer>
    </div>
  )
}

export const Spectrums = () => {
  const spectrums = [
    {playerId: "player 1", score: 12, spec: Array.from({ length: 10 }, () => Math.floor(Math.random() * 20) + 1), penalty: Math.floor(Math.random() * 15) + 1},
    {playerId: "player 2", score: 24524, spec: Array.from({ length: 10 }, () => Math.floor(Math.random() * 20) + 1), penalty: Math.floor(Math.random() * 15) + 1},
    // {playerId: "player 3", score: 45365, spec: Array.from({ length: 10 }, () => Math.floor(Math.random() * 20) + 1), penalty: Math.floor(Math.random() * 15) + 1}
  ];
  
  return (
    <div className="spectrum_list">
      {spectrums.map((s) => (
        <Spectrum key={s.playerId} info={s}/>
      ))}
    </div>
  )
}