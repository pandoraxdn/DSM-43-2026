import { View, StyleSheet, Text } from 'react-native';
import { useEffect, useState } from 'react';


export const UseEffectScreen = () => {
  const [ hora, setHora ] = useState( new Date() );
  const [ color, setColor ] = useState( 'violet' );

  const colors  = [ 'red', 'azul', 'brown', 'gray', 'purple' ];

  const random = () => {
    const color = colors[ Math.floor( Math.random() * colors.length ) ];
    setColor(color);
  }

  useEffect( () => {
    const interval = setInterval( () => {
      setHora( new Date() );
      return () => clearInterval(interval);
    },1000);

    const intervalColor = setInterval( () => {
      random();
      return () => clearInterval(intervalColor);
    },100);
  },[]);

  return(
    <View
      style={ style.container }
    >
      <Text
        style={{
          ...style.text,
          color: color
        }}
      >
        Fecha y hora: { hora.toLocaleString() }
      </Text>
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
    fontSize: 40,
    color: 'rgba(245, 73, 39, 0.8)',
    textAlign: 'center'
  }
});
