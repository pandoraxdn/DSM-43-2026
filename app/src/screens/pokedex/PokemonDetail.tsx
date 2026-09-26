import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { PokemonParams } from '../../navigator/PokemonNavigator';
import { useTypeColorPokemon } from '../../hooks/useTypeColorPokemon';
import { usePokemonFull } from '../../hooks/usePokemonFull';
import { PokemonInfo } from '../../components/PokemonInfo';

interface Props extends StackScreenProps<PokemonParams, 'PokemonDetail'>{};

export const PokemonDetail = ( { navigation, route }:Props ) => {

  const data = route.params.NewPokemonList;
  const { id, name, url, image } = data;
  const { isLoading, color } = useTypeColorPokemon(id);
  const { pokemonDetail } = usePokemonFull(id);

  return (
    <View
      style={{ flex: 1 }}
    >
      <View
        style={{ flex: 2, alignItems: 'center' }}
      >
        <View style={{
          ...style.leftContainer,
          backgroundColor: (isLoading) ? 'gray' : (color.length > 1) ? color[1] : color[0]
        }}/>

        <View style={{
          ...style.rightContainer,
          backgroundColor: (isLoading) ? 'gray' : color[0]
        }}/>
        
        <Image
          source={ require('./../../../assets/pokeball-light.png') }
          style={ style.pokeball }
        />

        <Image
          source={{ uri: image }}
          style={ style.pokemon }
        />

        <TouchableOpacity
          onPress={ () => navigation.goBack() }
        >
          <View
            style={ style.arrowBtn }
          >
            <Text
              style={ style.text }
            >
              {`<- #${id}`}
              {`\n${name}`}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View
        style={{ flex: 2 }}
      >
        {
          (!pokemonDetail) ? (
            <ActivityIndicator
              size={100}
              color={color[0]}
            />
          ) :
          (
            <PokemonInfo
              pokemon={ pokemonDetail }
            />
          )
        }
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  leftContainer: {
    //borderTopLeftRadius: 1000,
    backgroundColor: 'gray',
    borderBottomLeftRadius: 1000,
    height: "100%",
    left: 0,
    position: 'absolute',
    top: 0,
    width: "50%"
  },
  rightContainer: {
    //borderBottomRightRadius: 1000,
    backgroundColor: 'pink',
    borderTopRightRadius: 1000,
    height: "100%",
    position: 'absolute',
    right: 0,
    top: 0,
    width: "50%"
  },
  pokeball: {
    height: 300,
    width: 300,
    position: 'absolute',
    top: 30,
    opacity: 0.7,
  },
  pokemon: {
    height: 240,
    width: 240,
    position: 'absolute',
    top: 60,
  },
  arrowBtn: {
    left: -180,
    top: 0,
    position: 'absolute',
  },
  headerContainer: {
    alignItems: 'center',
    height: 370,
    zIndex: 999,
  },
  text: {
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold'
  },
  containerBottom: {
    top: 370,
    height: 500,
    width: "100%",
    position: 'absolute'
  }
});
