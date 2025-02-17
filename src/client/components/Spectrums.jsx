import React from 'react'

export const Spectrum = ({info}) => {
  return (
    <div className="spectrum">
      <header>{info.playerId}</header>
      <div className="cells">
        {Array.from({ length: 20 * 10 }).map((_, index) => (
          <div key={index} className="spec_cell" />
        ))}
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