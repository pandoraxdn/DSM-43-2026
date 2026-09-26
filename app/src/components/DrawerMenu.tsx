import { View, Text, Image, TouchableOpacity, StyleSheet} from "react-native";
import { DrawerContentScrollView, DrawerContentComponentProps } from "@react-navigation/drawer";

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
            source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqMRKTwf-zYsaWB9QU5hXY8PBNLgQo61e5ML_g6P4NWA&s=10' }}
          />
        </View>
        <Text
          style={ style.userText }
        >
          User Pandora
        </Text>
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

