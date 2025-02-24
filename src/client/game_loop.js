import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStatus } from './store.js';
import { pos$, key$, next_pieces$ } from './index.jsx';
import flyd from 'flyd';
import socket from './socket.js';

export const useGameLoop = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.game_state.status);
  const room_id = useSelector((state) => state.game_state.room_id);
  // const playerid = useSelector((state) => state.player.id);
  const next_pieces = useSelector((state) => state.game_state.next_pieces);
  // const y = useSelector((state) => state.game_state.y);

  useEffect(() => {
    if (status !== 'playing') {
      return;
    }

    const subscription = flyd.map((key) => {
      // dispatch(setStatus(key));
    }, key$);

    const intervalId = setInterval(() => {
      if (next_pieces$().length < 3) socket.emit('next_piece', { room_id });
      // if (next_pieces.length < 3) {
      //   socket.emit('next_piece');
      // }
      // console.log(next_pieces.length);
      console.log('Game loop');
      // dispatch(incrementY());
      // console.log(y);
      pos$(pos$() + 10);
    }, 1500);

    return () => {
      subscription.end(true);
      clearInterval(intervalId);
    };
  }, [status, dispatch]);
};
