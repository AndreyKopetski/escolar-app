import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/constants/colors';

type Phase = 'logo' | 'expand' | 'rotate' | 'shrink';

export default function SplashScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('logo');

  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const circleScale  = useRef(new Animated.Value(0)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t0 = setTimeout(() => {
      Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, 50);

    const t1 = setTimeout(() => {
      setPhase('expand');
      Animated.timing(circleScale, { toValue: 1, duration: 550, useNativeDriver: true }).start();
    }, 600);

    const t2 = setTimeout(() => {
      setPhase('rotate');
      Animated.timing(iconRotation, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    }, 1200);

    const t3 = setTimeout(() => {
      setPhase('shrink');
      Animated.timing(circleScale, { toValue: 0, duration: 550, useNativeDriver: true }).start();
    }, 2000);

    const t4 = setTimeout(() => {
      router.replace('/login');
    }, 2900);

    return () => [t0, t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  const rotate = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isExpanded = phase === 'expand' || phase === 'rotate';

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, { transform: [{ scale: circleScale }] }]} />

      <Animated.View style={{ opacity: logoOpacity, zIndex: 10 }}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Svg width={80} height={80} viewBox="0 0 64 64" fill="none">
            <Path
              d="M0 0V26.1712L37.7889 63.9025H64V0H0Z"
              fill={isExpanded ? 'transparent' : colors.base.brand}
            />
            <Path
              d="M40.6188 29.421L42.4299 27.6127L48.619 21.4409L42.4299 15.2612L36.2407 21.4409L34.4297 23.2492V20.6861V11.9512H25.6814V20.6861V23.2492L23.8704 21.4409L17.6891 15.2612L11.5 21.4409L17.6891 27.6127L19.5002 29.421L23.8704 33.7924L25.6814 35.6007L28.2484 38.1638L30.0595 39.9721L34.4297 44.3356L36.2407 46.1439L42.4299 52.3236L48.619 46.1439L42.4299 39.9721L40.6188 38.1638H43.1779H51.9262V29.421H43.1779H40.6188Z"
              fill="black"
            />
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: 3000,
    height: 3000,
    borderRadius: 1500,
    backgroundColor: colors.base.brand,
  },
});
