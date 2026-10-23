import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

export const NeonBorder = () => {

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      <View style={[styles.layer, styles.outer]} />
      <View style={[styles.layer, styles.mid]} />
      <View style={[styles.layer, styles.inner]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  layer: { position: 'absolute' },
  outer: {
    top: 2, left: 2, right: 2, bottom: 2,
    borderWidth: 4,
    borderRadius: 36,
    borderColor: 'rgba(52,211,153,0.18)',
  },
  mid: {
    top: 6, left: 6, right: 6, bottom: 6,
    borderWidth: 3,
    borderRadius: 32,
    borderColor: 'rgba(52,211,153,0.4)',
  },
  inner: {
    top: 9, left: 9, right: 9, bottom: 9,
    borderWidth: 2,
    borderRadius: 29,
    borderColor: '#6ee7b7',
    shadowColor: '#34d399',
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
});
