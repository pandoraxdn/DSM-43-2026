import { View, Text } from 'react-native';
import { appTheme } from '../../theme/appTheme';

export const PokemonDetail = () => {
  return(
    <View
      style={ appTheme.container }
    >
      <Text
        style={ appTheme.text }
      >
        PokemonHome
      </Text>
    </View>
  );
}
