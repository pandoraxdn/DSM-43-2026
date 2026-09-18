//import { PositionScreen } from "./src/screens/PositionScreen";
//import { BoxObjectModelScreen } from "./src/screens/BoxObjectModelScreen";
//import { CounterScreen } from "./src/screens/CounterScreen";
//import { CounterReducerScreen } from "./src/screens/CounterReducerScreen";
//import { UseEffectScreen } from "./src/screens/UseEffectScreen";
//import { StackNavigator } from "./src/navigator/StackNavigator";
import { NavigationContainer } from '@react-navigation/native';
import { PokemonNavigator } from "./src/navigator/PokemonNavigator";

const App = () => {
  return (
    <NavigationContainer>
      <PokemonNavigator/>
    </NavigationContainer>
  );
}

export default App;
