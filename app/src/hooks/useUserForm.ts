import { useReducer } from "react";
import { useUserApi } from "./useUserApi";

export interface FormUserData {
  id_user:    number;
  username:   string;
  email:      string;
  password:   string;
  imagen:     string;
  location:   string;
}

interface UseUserForm{
  state: FormUserData;
  handleInputChange: ( fieldName: keyof FormUserData, value: string | number ) => void;
  handleSubmit: () => void;
  handleDelete: () => void;
}

export const useUserForm = (): UseUserForm => {

  const initialForm: FormUserData = {
    id_user: 0,
    username: '',
    email:    '',
    password: '',
    imagen:   '',
  }

  type Action = { type: 'handleInputChange', payload: { fieldName: keyof FormUserData, value: string | number } };

  const formReducer = ( state: FormUserData, action: Action ) => {
    switch( action.type ){
      case 'handleInputChange':
        return {
          ...state,
          [ action.payload.fieldName ] : action.payload.value
      }
    }
  }

  const [ state, dispatch ] = useReducer( formReducer, initialForm );
  const { createUser, updateUser, deleteUser } = useUserApi();

  const handleInputChange = ( fieldName: keyof FormUserData, value: string | number ) => {
    dispatch({ type: 'handleInputChange', payload: { fieldName, value } });
  }

  const handleSubmit = () => {
    if ( state.id_user == 0 ){
      createUser( state );
    }else {
      updateUser( state );
    }
  }

  const handleDelete = () => deleteUser( state );

  return { state, handleInputChange, handleSubmit, handleDelete };

}
