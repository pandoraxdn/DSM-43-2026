import LoginUser from "../screens/users/LoginUser";
import { AuthContext } from "../context/AuthContext";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { DrawerMenu } from "../components/DrawerMenu";
import { FormScreen } from "../screens/FormScreen";
import { ImagePickerScreen } from "../screens/ImagePickerScreen";
import { LocationScreen } from "../screens/LocationScreen";
import { PokemonNavigator } from "./PokemonNavigator";
import { StackNavigator } from "./StackNavigator";
import { useContext } from "react";
import { UserStackNavigator } from "./UserStackNavigator";
import { useWindowDimensions } from "react-native";

export type RootDrawerParams = {
  StackNavigator:     undefined;
  PokemonNavigator:   undefined;
  FormScreen:         undefined;
  ImagePickerScreen:  undefined;
  LocationScreen:     undefined;
  UserStackNavigator: undefined;
  LoginUser:          undefined;
}

const Drawer = createDrawerNavigator<RootDrawerParams>();

const Navigator = () => {

  const { width } = useWindowDimensions();

  return (
    <Drawer.Navigator
      initialRouteName='UserStackNavigator'
      screenOptions={{
        drawerPosition: 'right',
        drawerType:  width > 720 ? 'permanent' : 'front',
        headerShown: true,
        overlayColor: 'rgba(255,0,128,0.6)',
        drawerStyle: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          width: width * 0.7
        }
      }}
      drawerContent={ (props) => <DrawerMenu {...props}/> }
    >
      <Drawer.Screen
        name="StackNavigator"
        component={StackNavigator}
      />
      <Drawer.Screen
        name="PokemonNavigator"
        component={PokemonNavigator}
      />
      <Drawer.Screen
        name="FormScreen"
        component={FormScreen}
      />
      <Drawer.Screen
        name="ImagePickerScreen"
        component={ImagePickerScreen}
      />
      <Drawer.Screen
        name="LocationScreen"
        component={LocationScreen}
      />
      <Drawer.Screen
        name="UserStackNavigator"
        component={UserStackNavigator}
      />
      <Drawer.Screen
        name="LoginUser"
        component={LoginUser}
      />
    </Drawer.Navigator>
  );
}

export const DrawerNavigator = () => {
  const { authState } = useContext( AuthContext );
  return ( authState.isLoggedIn ) ? <Navigator /> : <LoginUser/>;
}






