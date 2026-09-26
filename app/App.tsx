//import { BoxObjectModelScreen } from "./src/screens/BoxObjectModelScreen";
//import { CounterReducerScreen } from "./src/screens/CounterReducerScreen";
//import { CounterScreen } from "./src/screens/CounterScreen";
//import { PokemonNavigator } from "./src/navigator/PokemonNavigator";
//import { PositionScreen } from "./src/screens/PositionScreen";
//import { StackNavigator } from "./src/navigator/StackNavigator";
//import { UseEffectScreen } from "./src/screens/UseEffectScreen";
import { ReactNode } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { DrawerNavigator } from './src/navigator/DrawerNavigator';
import { NavigationContainer } from '@react-navigation/native';

const App = () => {
  return (
    <AppState>
      <NavigationContainer>
        <DrawerNavigator/>
      </NavigationContainer>
    </AppState>
  );
}

const AppState = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      { children }
    </AuthProvider>
  );
}

export default App;
