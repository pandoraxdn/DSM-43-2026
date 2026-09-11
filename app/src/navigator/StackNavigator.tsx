import { createStackNavigator } from "@react-navigation/stack";
import { Screen1 } from "../screens/stack/Screen1";
import { Screen2 } from "../screens/stack/Screen2";
import { Screen3 } from "../screens/stack/Screen3";

export type StackParams = {
  Screen1: undefined;
  Screen2: undefined;
  Screen3: undefined;
}

const Stack = createStackNavigator<StackParams>();

export const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Screen1"
        component={Screen1}
      />
      <Stack.Screen
        name="Screen2"
        component={Screen2}
      />
      <Stack.Screen
        name="Screen3"
        component={Screen3}
      />
    </Stack.Navigator>
  );
}
