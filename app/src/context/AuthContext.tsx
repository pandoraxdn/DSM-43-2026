import { createContext, useReducer, ReactNode } from "react";
import { authReducer } from "./authReducer";

export interface AuthState {
  isLoggedIn:   boolean;
  username:     string | undefined;
  avatar:       string | undefined;
}

export const authInicialState: AuthState = {
  isLoggedIn: false,
  username: undefined,
  avatar: undefined,
}

export interface AuthContextProps {
  authState: AuthState;
  singIn: () => void;
  logout: () => void;
  changeUsername: ( username: string ) => void;
  changeAvatar: ( avatar: string ) => void;
}

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = (  { children }: { children: ReactNode } ) => {

  // Reducer
  const [ authState, dispatch ] = useReducer( authReducer, authInicialState );

  const singIn = () => dispatch({ type: 'singIn' });
  const logout = () => dispatch({ type: 'logout' });
  const changeUsername = ( username: string ) => dispatch({ type: 'changeUsername', payload: username});
  const changeAvatar = ( avatar: string ) => dispatch({ type: 'changeAvatar', payload: avatar});

  return (
    <AuthContext.Provider
      value={{
        authState,
        singIn,
        logout,
        changeUsername,
        changeAvatar
      }}
    >
      { children }
    </AuthContext.Provider>
  );

}




