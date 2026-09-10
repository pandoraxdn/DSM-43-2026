import { View, Text, StyleSheet } from 'react-native';

export const BoxObjectModelScreen = () => {
    return(
      <View
        style={style.container}
      >
        <View
          style={style.boxViolet}
        >
          <Text
            style={ style.title }
          >
            BoxObjectModelScreen
          </Text>
        </View>
        <Text
          style={ style.title }
        >
          Pandora
        </Text>
      </View>
    );
}

const style = StyleSheet.create({
  container: {
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    //borderWidth: 3,
    //marginBottom,
    //marginLeft,
    //marginRight,
    //marginTop: 20,
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'justify'
  },
  boxViolet: {
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'violet',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 50,
    padding: 5,
    borderRadius: 10
  }
});
