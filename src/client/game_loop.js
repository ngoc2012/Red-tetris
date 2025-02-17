import { useSelector } from 'react-redux';
import { Info } from './components/Info.jsx';
import { key$ } from './index.jsx';
import flyd from 'flyd';

export const game_loop = (i) => {
  const status = useSelector((state) => state.game_state.status);
  const subscription = flyd.map((key) => {
    Info.setStatus(key);
  }, key$);

  if (status === "game_over") {
    subscription.end(true);
    return;
  }
  setInterval(game_loop(i + 1), 1500);
}