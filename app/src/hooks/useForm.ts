import { useReducer } from "react";

interface UseForm {
  state: FormState;
  handleInputChange: ( fieldName: keyof FormState, value: string ) => void;
}

export interface FormState {
  username: string;
  password: string;
  phone:  string;
  email: string;
  age:  string;
  stateCivil: string;
}

export const initialForm: FormState = {
  username: '',
  password: '',
  phone: '',
  email: '',
  age: '',
  stateCivil: ''
}

type Action = { type: 'handleInputChange', payload: { fieldName: keyof FormState, value: string}};

const formReducer = ( state: FormState, action: Action ) => {
  switch( action.type ){
    case 'handleInputChange':
      return {
        ...state,
        [ action.payload.fieldName ]: action.payload.value
    }
  }
}

export const userForm = (): UseForm => {
  const [ state, dispatch ] = useReducer( formReducer, initialForm );
  const handleInputChange = ( fieldName: keyof FormState, value: string ) => {
    dispatch({ type: 'handleInputChange', payload : { fieldName, value}});
  }
  return { state, handleInputChange };
}


