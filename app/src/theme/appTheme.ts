import { StyleSheet } from "react-native";

export const appTheme = StyleSheet.create({
  container: {
    alignContent: 'center',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  text: {
    color: 'violet',
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  textInput: {
    backgroundColor: 'white',
    borderColor: 'violet',
    borderRadius: 10,
    borderWidth: 5,
    fontSize: 22,
    fontWeight: 'bold',
    height: 50,
    marginTop: 10,
    textAlign: 'center',
    width: 350
  }
});
