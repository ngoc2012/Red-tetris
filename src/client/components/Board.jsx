import React, { useState, useEffect} from 'react';
import { key$ } from '../index.jsx'
import flyd from 'flyd'

export const Board = () => {
  // useEffect(() => {
  //   const subscription = flyd.map((key) => {
  //     setStatus(key);
  //   }, key$);
  
  //   return () => {
  //     subscription.end(true);
  //   };
  // }, []);
  return (
    <div className="board">
      {Array.from({ length: 20 * 10 }).map((_, index) => (
        <div key={index} className="cell empty"></div>
      ))}
    </div>
  )
}