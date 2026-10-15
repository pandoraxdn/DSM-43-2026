import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  title:      string;
  color:      string;
  position:   'right' | 'left';
  action:     () => void;
}

export const Fab = ( { title, color = 'violet',  position, action }:Props ) => {

  const btnPosition = ( position == 'right' ) ? style.fabLocationBr : style.fabLocationBl;

  return(
    <TouchableOpacity
      onPress={ action }
      style={ btnPosition }
    >
      <View
        style={{
          ...style.fab,
          backgroundColor: color
        }}
      >
        <Text
          style={ style.fabText }
        >
          { title }
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const style = StyleSheet.create({
  fabLocationBr: {
    position: 'absolute',
    bottom: 25,
    right: 25
  },
  fabLocationBl: {
    position: 'absolute',
    bottom: 25,
    left: 25
  },
  fab: {
    backgroundColor: 'blue',
    width: 60,
    height: 60,
    borderRadius: 100,
    justifyContent: 'center'
  },
  fabText: {
    color: "white",
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});







