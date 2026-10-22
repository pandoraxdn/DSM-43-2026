import { useReducer, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LoginReponse } from "../interfaces/pandoraApiResponse";
import { pandoraApi } from "../api/pandoraApi";

export interface LoginData {
  email: string;
  password: string;
}

export interface UseLogin {
  isLoading: boolean;
  state:  LoginData;
  handleLogin: () => void;
  handleInputChange: ( fieldName: keyof LoginData, value: string ) => void;
  request: LoginReponse;
}

export const useLogin = () => {

  const initialState: LoginData = {
    email: '',
    password: ''
  }

  type Action = { type: 'handleInputChange', payload: { fieldName: keyof LoginData, value: string } };

  const dataReducer = ( state: LoginData, action: Action ) => {
    switch( action.type ){
      case 'handleInputChange':
        return {
          ...state,
          [ action.payload.fieldName ] : action.payload.value
      }
    }
  }

  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ state, dispatch ] = useReducer( dataReducer, initialState );
  const [ request, setRequest ] = useState<LoginReponse>({} as LoginReponse);
  const { singIn, changeUsername, changeAvatar } = useContext( AuthContext ); 

  const apiUrl: string = 'http://192.168.1.65:3000/users/login';

  const handleInputChange = ( fieldName: keyof LoginData, value: string ) => {
    dispatch({  type:'handleInputChange', payload: { fieldName, value } });
  }

  const handleLogin = async () => {
    setIsLoading(true);

    const dataBody = {
      email: state.email,
      password: state.password,
    }

    try{
      const response = await pandoraApi.post<LoginReponse>(apiUrl, dataBody);

      setRequest( response.data );

      (response.data) && ( () => {
        singIn();
        response.data?.username && changeUsername(response.data.username);
        response.data?.imagen && changeAvatar(response.data.imagen);
      })();

    } catch (error){
      console.log('Error:', error);
    }
  }

  return { isLoading, state, handleLogin, handleInputChange, request };

}
