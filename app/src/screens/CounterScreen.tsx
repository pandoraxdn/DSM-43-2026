import { View, Text, StyleSheet} from 'react-native';
import { BtnTouch } from '../components/BtnTouch';
import { useCounter } from '../hooks/useCounter';

export const CounterScreen = () => {

  const { counter, add, decrement, reset } = useCounter(0);

  return(
    <View
      style={style.container}
    >
      <Text
        style={style.text}
      >
        Contador: {counter}
      </Text>

      <BtnTouch
        text="Add"
        color='violet'
        borderColor='white'
        onPress={ () => add() }
      />

      <BtnTouch
        text="Decrement"
        color='red'
        borderColor='orange'
        onPress={ () => decrement() }
      />

      <BtnTouch
        text="Reset"
        onPress={ () => reset() }
      />

    </View>
  );
}

const style = StyleSheet.create({
  container: {
    alignContent: 'center',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  text: {
    backgroundColor: 'gray',
    color: 'pink',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20
  }
});
