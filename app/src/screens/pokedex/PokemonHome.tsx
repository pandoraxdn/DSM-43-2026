import { View, Text, Image, ActivityIndicator, FlatList } from 'react-native';
import { appTheme } from '../../theme/appTheme';
import { usePokemonPaginated } from '../../hooks/usePokemonPaginated';
import { PokemonCard } from '../../components/PokemonCard';

export const PokemonHome = () => {

  const { isLoading, simplePokemonList, loadPokemons } = usePokemonPaginated();

  return(
    <View
      style={ appTheme.container }
    >
      <Image
        style={{
          width: 300,
          height: 300,
          position: 'absolute',
          right: -100,
          top: -100
        }}
        source={ require('./../../../assets/pokeball-dark.png') }
      />
      <FlatList
        data={ simplePokemonList }
        keyExtractor={ (pokemon, index) => `${pokemon.id}${index}` }
        ListHeaderComponent={(
          <View
            style={{
              ...appTheme.container,
            }}
          >
            <Text
              style={{
                ...appTheme.text,
                fontSize: 60,
                marginVertical: 20,
              }}
            >
              Pokedex
            </Text>
          </View>
        )}
        numColumns={2}
        renderItem={ ({item}) => (
          <PokemonCard
            pokemon={item}
          /> 
        )}
        showsVerticalScrollIndicator={false}
        onEndReached={ loadPokemons }
        onEndReachedThreshold={ 0.2 }
        ListFooterComponent={(
          <ActivityIndicator
            style={{ height: 120 }}
            size={ 50 }
            color="pink"
          />
        )}
      />
    </View>
  );
}
