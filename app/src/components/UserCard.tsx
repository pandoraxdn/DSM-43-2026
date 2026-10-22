import { View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import { UserReponse } from '../interfaces/pandoraApiResponse';
import { useNavigation } from '@react-navigation/native';

interface Props {
  user: UserReponse;
}

export const UserCard = ( { user }:Props ) => {

  const navigation = useNavigation();

  return(
    <TouchableOpacity
      onPress={ () => navigation.navigate('FormUser',{...user}) }
    >
      <View
        style={ style.cardContainer }
      >
        <Text
          style={ style.text }
        >
          { `Usuario: \n${user.username}` }
        </Text>
        <Text
          style={{
            ...style.text,
            fontSize: 15
          }}
        >
          { `Correo: \n ${user.email}\n` }
          { `Last update: \n ${user.update}` }
        </Text>
        <Image
          style={ style.avatar }
          source= {{ uri: `data:image/png;base64,${user.imagen}`}}
        />
      </View>
    </TouchableOpacity>
  );
}

const style = StyleSheet.create({
  avatar: {
    borderColor: "white",
    borderRadius: 100,
    borderWidth: 5,
    height: 50,
    position: 'absolute',
    right: -10,
    top: -10,
    width: 50
  },
  cardContainer: {
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'olive',
    borderColor: "yellow",
    borderRadius: 10,
    borderWidth: 5,
    height: 100,
    justifyContent: 'center',
    marginHorizontal: 5,
    overflow: 'hidden',
    width: 160
  },
  text: {
    fontSize: 18,
    color: "white",
    textAlign: "center"
  }
});




