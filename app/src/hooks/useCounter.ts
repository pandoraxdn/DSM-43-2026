import { useState } from "react";

interface UseCounter {
  counter:    number;
  add:        () => void;
  decrement:  () => void;
  reset:      () => void;
}

export const useCounter = ( initialValue: number ): UseCounter => {
  const [ counter, setCounter ] = useState(initialValue);

  const add = () => setCounter(counter + 1);
  const decrement = () => (counter == 0) ? setCounter(0) : setCounter(counter - 1);
  const reset = () => setCounter( initialValue );

  return { counter, add, decrement, reset };
}
