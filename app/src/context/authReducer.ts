import { AuthState } from "./AuthContext";

type Actions =
  | { type: 'singIn' }
  | { type: 'logout' }
  | { type: 'changeUsername', payload: string }
  | { type: 'changeAvatar', payload: string };

export const authReducer =  ( state: AuthState, action: Actions ) => {
  switch( action.type ){
    case 'singIn':{
      return{
        ...state,
        isLoggedIn: true,
        username: 'no_name_user_yet'
      }
    }
    case 'logout':{
      return{
        ...state,
        isLoggedIn: false,
        username: undefined,
        avatar: undefined 
      }
    }
    case 'changeUsername':{
      return{
        ...state,
        username: action.payload
      }
    }
    case 'changeAvatar':{
      return{
        ...state,
        avatar: action.payload
      }
    }
  }
}
