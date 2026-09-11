import { useReducer } from "react";

interface AuthState{
  count: number;
}

interface UseCounterReducer{
  state:      AuthState;
  add2:         () => void;
  add:          () => void;
  decrement2:   () => void;
  decrement:    () => void;
  reset:        () => void;
}

type Actions = 
  | { type: 'add' } 
  | { type: 'add2' } 
  | { type: 'reset', payload: { count: number } } 
  | { type: 'decrement2' }
  | { type: 'decrement' };


const counterReducer = ( state: AuthState, action: Actions ) => {
  switch( action.type ){
    case 'add':
      return { count: state.count + 1 }
    case 'add2':
      return { count: state.count + 2 }
    case 'reset':
      return { count: action.payload.count }
    case 'decrement':
      return { count: (state.count == 0) ? 0 : state.count - 1 }
    case 'decrement2':
      return { count: (state.count == 0) ? 0 : state.count - 2 }
  }
}

export const useCounterReducer = ( initialValue: AuthState ): UseCounterReducer => {

  const [ state, dispatch ] = useReducer( counterReducer, initialValue );

  const add = () => dispatch({ type: 'add' });
  const add2 = () => dispatch({ type: 'add2' });
  const decrement = () => dispatch({ type: 'decrement' });
  const decrement2 = () => dispatch({ type: 'decrement2' });
  const reset = () => dispatch({ type: 'reset', payload: {...initialValue} });

  return { state, add, decrement, reset, add2, decrement2 };
}
