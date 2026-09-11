import { View, Text } from 'react-native';
import { appTheme } from '../../theme/appTheme';
import { StackParams } from '../../navigator/StackNavigator';
import { StackScreenProps } from '@react-navigation/stack';
import { BtnTouch } from '../../components/BtnTouch';

interface Props extends StackScreenProps<StackParams,'Screen2'>{};

export const Screen3 = ( { navigation }:Props ) => {
    return(
        <View
          style={ appTheme.container }
        >
            <Text
              style={ appTheme.text }
            >
                Screen3
            </Text>

            <BtnTouch
              text='Home'
              onPress={ () => navigation.popToTop() }
            />
            <BtnTouch
              text='<-'
              onPress={ () => navigation.goBack() }
            />
        </View>
    );
}
