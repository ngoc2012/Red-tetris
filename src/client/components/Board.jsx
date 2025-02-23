import React, { useState, useEffect} from 'react';
import { key$ } from '../index.jsx'
import flyd from 'flyd'
import { useGamepads } from 'react-gamepads';
import socket from '../socket.js';

export const Board = () => {

  useEffect(() => {
    socket.emit('new_room');

    const subscription = flyd.map((key) => {
      // Key pressed logic here
      console.log(key);
    }, key$);
  
    return () => {
      subscription.end(true);
    };
  }, []);
  
  // Gamepad logic
  const [gamepads, setGamepads] = useState({});
  useGamepads(gamepads => setGamepads(gamepads));

  useEffect(() => {
    if (gamepads[0] !== undefined) {
      gamepads[0].buttons.forEach((button, index) => {
        if (button.pressed) {
          console.log('Button pressed:', index);
        }
      });
      gamepads[0].axes.forEach((value, index) => {
        if (value !== 0) {
          if (index === 0) {
            if (value === -1)
              console.log('Left pressed');
            else if (value === 1)
              console.log('Right pressed');
          } else if (index === 1) {
            if (value === -1)
              console.log('Up pressed');
            else if (value === 1)
              console.log('Down pressed');
          }
        }
      });
    }
  }, [gamepads[0]]);

  return (
    <div className="board">
      {Array.from({ length: 20 * 10 }).map((_, index) => (
        <div key={index} className="cell empty"></div>
      ))}
    </div>
  )
}