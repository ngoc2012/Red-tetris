export const storeStateMiddleWare = ({ getState }) => {
  return (next) => (action) => {
    const returnValue = next(action);
    window.top.state = getState();
    return returnValue;
  };
};
