import React from 'react'

export const Spectrum = ({info}) => {
  return (
    <div>Spectrum of {info.playerId}</div>
  )
}

export const Spectrums = ({spectrums}) => {
  return (
    <div>
      <header>Spectrums</header>
      {spectrums.map((s) => (
        <Spectrum key={s.playerId} info={s}/>
      ))}
    </div>
  )
}