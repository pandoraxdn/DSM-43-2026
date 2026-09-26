import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NewPokemonList } from '../interfaces/pokemonReponse';
import { useTypeColorPokemon } from '../hooks/useTypeColorPokemon';

interface Props{
  pokemon: NewPokemonList;
}

const widthWindows = Dimensions.get('window').width;

export const PokemonCard = ( { pokemon }:Props ) => {

  const { isLoading, color } = useTypeColorPokemon( pokemon.id );
  const navigation = useNavigation();

  return(
    <TouchableOpacity
      onPress={ () => navigation.navigate('PokemonDetail', { NewPokemonList: pokemon }) }
    >
      <View
        style={{
          ...style.containerCard,
          width: widthWindows * 0.4
        }}
      >
        <View
          style={{
            ...style.backgroundTop,
            backgroundColor: (isLoading) ? 'gray' : (color.length > 1) ? color[1] : color[0]
          }}
        />
        <View
          style={{
            ...style.backgroundBottom,
            backgroundColor: (isLoading) ? 'gray' : color[0]
          }}
        />
        <Image
          style={ style.pokeball }
          source={ require('./../../assets/pokeball-light.png') }
        />
        <Image
          style={ style.pokemon }
          source={{ uri: pokemon.image }}
        />
        <Text
          style={ style.name }
        >
          { pokemon.name }
          { `\n#${pokemon.id}` }
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const style = StyleSheet.create({
  containerCard: {
    borderRadius: 20,
    height: 120,
    marginBottom: 25,
    marginHorizontal: 10,
    overflow: 'hidden',
    width: 120,
  },
  backgroundTop: {
    backgroundColor: 'purple',
    bottom: "50%",
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    transform: [
      { rotateX: "20deg" },
      { rotateY: "-45deg" },
      { scale: 2 }
    ]
  },
  backgroundBottom: {
    backgroundColor: 'violet',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: "50%",
    transform: [
      { rotateX: "20deg" },
      { rotateY: "-45deg" },
      { scale: 2 }
    ]
  },
  pokeball: {
    height: 120,
    width: 120,
    position: 'absolute',
    bottom: -20,
    right: -20,
    opacity: 0.7
  },
  pokemon: {
    height: 100,
    width: 100,
    position: 'absolute',
    right: -8,
    bottom: -10
  },
  name: {
    fontSize: 25,
    color: "white",
    fontWeight: 'bold',
    marginHorizontal: 10
  }
});




