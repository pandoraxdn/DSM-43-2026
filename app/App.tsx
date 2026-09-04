import { View, Text } from "react-native";

let nombre: string = "Rodrigo";

const App = () => {

  const grupo: string = "DSM-43";

  return (
    <View
      style={{
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center'
      }}
    >
      <Text
        style={{
          marginTop: 400,
          fontSize: 30,
          textAlign: 'center'
        }}
      >
        Hola {nombre}, saludos del grupo: {grupo}
      </Text>
    </View>
  );
}

export default App;
