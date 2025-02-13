import React from 'react'
import { Board } from './Board.jsx'
import { Spectrums } from './Spectrums.jsx'

export const Tetris = () => {
  return (
    <div>
      <div id="Board">
        <Board />
      </div>
      <div id="Info">
        <div>4 next </div>
        <div id="Score">Score ...</div>
        <div>Game status</div>
        <header>Players spectrums</header>
        <Spectrums spectrums={[{playerId:1}]}/>
      </div>
    </div>
  )
}
