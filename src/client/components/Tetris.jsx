import React from 'react'
import { Board } from './Board.jsx'
import { Spectrums } from './Spectrums.jsx'

export const Tetris = () => {
  return (
    <div>
      <div id="left">Info: Score ...</div>
      <div id="center">
        <header>4 next </header>
        <Board />
        <footer>Game status</footer>
      </div>
      <div id="right">
        <header>Players spectrums</header>
        <Spectrums spectrums={[{playerId:1}]}/>
      </div>
    </div>
  )
}
