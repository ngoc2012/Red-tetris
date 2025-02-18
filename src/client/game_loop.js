import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStatus } from './store.js';
import { key$ } from './index.jsx';
import flyd from 'flyd';

export const useGameLoop = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.game_state.status);

  useEffect(() => {
    if (status === 'game_over') {
      return;
    }

    const subscription = flyd.map((key) => {
      dispatch(setStatus(key));
    }, key$);

    const intervalId = setInterval(() => {
      // Game loop logic here
      console.log('Game loop');
    }, 1500);

    return () => {
      subscription.end(true);
      clearInterval(intervalId);
    };
  }, [status, dispatch]);
};
