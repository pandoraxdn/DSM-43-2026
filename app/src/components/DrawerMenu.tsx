import { View, Text, Image, TouchableOpacity, StyleSheet} from "react-native";
import { DrawerContentScrollView, DrawerContentComponentProps } from "@react-navigation/drawer";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { BtnTouch } from "./BtnTouch";

interface BtnProps{
  navigate: () => void;
  text: string;
}

const BtnMenu = ( { navigate, text }:BtnProps ) => {
  return(
    <TouchableOpacity
      onPress={ navigate }
    >
      <View
        style={ style.bgText }
      >
        <Text style={ style.text } >
          { text }
        </Text>
      </View> 
    </TouchableOpacity>
  );
}

export const DrawerMenu = ( { navigation }: DrawerContentComponentProps ) => {
  const { authState, logout} = useContext( AuthContext );
  return (
    <DrawerContentScrollView>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <View
          style={ style.borderAvatar }
        >
          <Image
            style={ style.avatar }
            source={
              (authState.isLoggedIn) ?
              {uri: `data:image/png;base64,${authState.avatar}`}
              :
              { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqMRKTwf-zYsaWB9QU5hXY8PBNLgQo61e5ML_g6P4NWA&s=10' }
            }
          />
        </View>
        <Text
          style={ style.userText }
        >
          User: { authState.username }
        </Text>
        {
          (authState.isLoggedIn) && (
            <BtnTouch
              text="Cerrar sesiòn"
              color="red"
              onPress={ () => logout() }
            />
          )
        }
        <View>
          <BtnMenu
            navigate={ () => navigation.navigate('StackNavigator') }
            text="Bolitas y palitos"
          />
          <BtnMenu
            navigate={ () => navigation.navigate('PokemonNavigator') }
            text="Pokedex"
          />
          <BtnMenu
            navigate={ () => navigation.navigate('FormScreen') }
            text="FormScreen"
          />
          <BtnMenu
            navigate={ () => navigation.navigate('ImagePickerScreen') }
            text="Seleccionar Image"
          />
          <BtnMenu
            navigate={ () => navigation.navigate('LocationScreen') }
            text="Localización"
          />
          <BtnMenu
            navigate={ () => navigation.navigate('UserStackNavigator') }
            text="Gestión de Usuarios"
          />
          <BtnMenu
            navigate={ () => navigation.navigate('LoginUser') }
            text="LoginUser"
          />
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

const style = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: 25,
    textAlign: 'center'
  },
  bgText: {
    backgroundColor: 'gray',
    marginTop: 10,
    width: 200,
    borderRadius: 20,
    borderColor: 'white',
    borderWidth: 5
  },
  avatar: {
    height: 200,
    width: 200,
    borderRadius: 100,
    borderWidth: 10,
    borderColor: "gray"
  },
  borderAvatar: {
    height: 210,
    width: 210,
    borderWidth: 30,
    borderColor: 'violet',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100
  },
  userText: {
    color: 'white',
    fontSize: 40,
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

