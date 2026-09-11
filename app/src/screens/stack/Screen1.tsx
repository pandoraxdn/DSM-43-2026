import { View, Text } from 'react-native';
import { appTheme } from '../../theme/appTheme';
import { StackParams } from '../../navigator/StackNavigator';
import { StackScreenProps } from '@react-navigation/stack';
import { BtnTouch } from '../../components/BtnTouch';

interface Props extends StackScreenProps<StackParams,'Screen1'>{};

export const Screen1 = ( { navigation }:Props ) => {
    return(
        <View
          style={ appTheme.container }
        >
            <Text
              style={ appTheme.text }
            >
                Screen1
            </Text>
            <BtnTouch
              text='->'
              onPress={ () => navigation.navigate('Screen2') }
            />
        </View>
    );
}
