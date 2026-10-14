import { createDrawerNavigator } from "@react-navigation/drawer";
import { StackNavigator } from "./StackNavigator";
import { useWindowDimensions } from "react-native";
import { PokemonNavigator } from "./PokemonNavigator";
import { DrawerMenu } from "../components/DrawerMenu";
import { FormScreen } from "../screens/FormScreen";
import { ImagePickerScreen } from "../screens/ImagePickerScreen";
import { LocationScreen } from "../screens/LocationScreen";
import { UserStackNavigator } from "./UserStackNavigator";

export type RootDrawerParams = {
  StackNavigator:     undefined;
  PokemonNavigator:   undefined;
  FormScreen:         undefined;
  ImagePickerScreen:  undefined;
  LocationScreen:     undefined;
  UserStackNavigator: undefined;
}

const Drawer = createDrawerNavigator<RootDrawerParams>();

export const DrawerNavigator = () => {

  const { width } = useWindowDimensions();

  return (
    <Drawer.Navigator
      initialRouteName='UserStackNavigator'
      screenOptions={{
        headerShown: true,
        drawerType:  width > 720 ? 'permanent' : 'front',
        drawerPosition: 'right',
        overlayColor: 'rgba(255,0,128,0.6)',
        drawerStyle: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          width: width * 0.75
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
    </Drawer.Navigator>
  );
}






