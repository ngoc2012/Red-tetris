// useFlyd.js
import { useEffect, useState } from "react";


/**
 * useFlyd — two-way binding between React and Flyd.
 *
 * @param {Stream} stream - Flyd stream to sync with.
 * @param {Function} [callback] - optional function to run whenever the stream updates.
 * @returns {any} value - the current value of the stream.
 */
export function useFlyd(stream, callback) {
  const [value, setValue] = useState(stream());

  useEffect(() => {
    const sub = stream.map((v) => {
      setValue(v);
      if (callback) callback(v);
    });
    return () => sub.end(true);
  }, [stream]);

  return value;
}