import { View, Text, Image, StyleSheet, ScrollView} from 'react-native';
import { PokemonDetailResponse } from '../interfaces/pokemonReponse';

interface Props {
  pokemon: PokemonDetailResponse;
}

export const PokemonInfo = ( { pokemon }:Props ) => {
  return(
    <ScrollView>
      <View
        style={ style.container }
      >
        <Text
          style={ style.text }
        >
          Base experience:  {pokemon && pokemon.base_experience }
        </Text>

        <Text
          style={ style.text }
        >
          Height:  {pokemon && pokemon.height }
        </Text>

        <Text
          style={ style.text }
        >
          Is Default:  {pokemon && (pokemon.is_default) ? 'True' : 'False' }
        </Text>
        <Text
          style={ style.text }
        >
          Weight:  {pokemon && pokemon.weight }
        </Text>
        <ScrollView
          horizontal={true}
        >
          {
            (pokemon.sprites?.front_shiny) && (
            <Image
              style={ style.picture }
              source={{ uri: pokemon.sprites.front_shiny }}
            />)
          }
          {
            (pokemon.sprites?.back_shiny) && (
            <Image
              style={ style.picture }
              source={{ uri: pokemon.sprites.back_shiny }}
            />)
          }
          {
            (pokemon.sprites?.front_default) && (
            <Image
              style={ style.picture }
              source={{ uri: pokemon.sprites.front_default }}
            />)
          }
          {
            (pokemon.sprites?.back_default) && (
            <Image
              style={ style.picture }
              source={{ uri: pokemon.sprites.back_default }}
            />)
          }
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const style = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: "black",
    fontSize: 30
  },
  picture: {
    width: 100,
    height: 100
  }
});





