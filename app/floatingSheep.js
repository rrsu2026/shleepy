import React, { useRef, useEffect } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';

const AnimatedSheep = ({ horizontalOffset, verticalPosition }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: 10,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -10,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: 10,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: -10,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [translateY, translateX]);

  return (
    <Animated.Image
      source={require('../assets/sheepwhite.png')}
      style={[
        styles.sheepImage,
        {
          transform: [
            { translateY },
            { translateX },
            { translateX: horizontalOffset },
            { translateY: verticalPosition },
          ],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
    sheepImage: {
        position: 'absolute',
        width: 100,
        height: 100,
        resizeMode: 'contain',
      },
});

export default AnimatedSheep;