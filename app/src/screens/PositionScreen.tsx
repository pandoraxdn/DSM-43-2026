import { View, StyleSheet, useWindowDimensions } from "react-native";

export const PositionScreen = () => {
  
  const {height, width} = useWindowDimensions();

  return (
    <View
      style={ style.container }
    >
      <View 
        style={{
          ...style.boxViolet,
          backgroundColor: 'olive',
          borderRadius: 100,
          height: width * 0.2,
          left: -20,
          position: 'absolute',
          top: -20,
          width: width * 0.2
        }}
      />
      <View 
        style={{
          ...style.boxViolet,
          //width: width,
          //height: height * 0.4,
        }}
      />
      <View 
        style={{
          ...style.boxBlack,
          //width: width,
          //height: height * 0.2,
        }}
      />
      <View 
        style={{
          ...style.boxBrown,
          //width: width,
          //height: height * 0.4,
        }}
      />
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column-reverse',
    justifyContent: 'space-evenly'
  },
  boxViolet: {
    //alignSelf: 'flex-start',
    backgroundColor: 'violet',
    height: 100,
    width: 100
  },
  boxBlack: {
    backgroundColor: 'black',
    height: 100,
    width: 100,
  },
  boxBrown: {
    //alignSelf: 'flex-end',
    backgroundColor: 'brown',
    height: 100,
    width: 100
  },
  text: {
   fontSize: 40
  }
});


