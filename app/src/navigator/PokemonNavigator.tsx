import { createStackNavigator } from "@react-navigation/stack";
import { PokemonHome } from "../screens/pokedex/PokemonHome";
import { PokemonDetail } from "../screens/pokedex/PokemonDetail";
import { NewPokemonList } from "../interfaces/pokemonReponse";

export type PokemonParams = {
  PokemonHome:    undefined;
  PokemonDetail:  NewPokemonList;
}

const Stack = createStackNavigator<PokemonParams>();

export const PokemonNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName='PokemonHome'
      screenOptions={{
        headerMode:'float',
        headerShown: false,
        cardStyle: {
          backgroundColor: 'white'
        }
      }}
    >
      <Stack.Screen
        name='PokemonHome'
        component={PokemonHome}
      />
      <Stack.Screen
        name='PokemonDetail'
        component={PokemonDetail}
      />
    </Stack.Navigator>
  );
}
