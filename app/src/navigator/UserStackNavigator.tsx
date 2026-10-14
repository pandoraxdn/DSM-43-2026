import { createStackNavigator } from "@react-navigation/stack";
import { HomeUser } from "../screens/users/HomeUser";
import { FormUser } from "../screens/users/FormUser";
import { FormUserData } from "../hooks/useUserForm";

export type StackUserParams = {
  FormUser: FormUserData;
  HomeUser: undefined;
}

const Stack = createStackNavigator<StackUserParams>();

export const UserStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName='HomeUser'
      screenOptions={{
        headerMode:'float',
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="HomeUser"
        component={HomeUser}
      />
      <Stack.Screen
        name="FormUser"
        component={FormUser}
      />
    </Stack.Navigator>
  );
}
