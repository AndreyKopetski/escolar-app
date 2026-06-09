import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, UIManager, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import MenuSheet from '@/components/MenuSheet';
import { useT } from '@/hooks/useT';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type NavItem = {
  labelKey: string;
  route: string;
  icon: (active: boolean) => React.ReactNode;
};

const iconColor = (active: boolean) => (active ? colors.brand[25] : colors.brand[300]);

const NAV_ITEMS: NavItem[] = [
  {
    labelKey: 'nav.boletim',
    route: '/(main)/boletim',
    icon: (active) => (
      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <Path d="M16.6693 10.417V5.66699C16.6693 4.26686 16.6693 3.5668 16.3968 3.03202C16.1571 2.56161 15.7747 2.17916 15.3042 1.93948C14.7695 1.66699 14.0694 1.66699 12.6693 1.66699H7.33594C5.93581 1.66699 5.23574 1.66699 4.70096 1.93948C4.23056 2.17916 3.8481 2.56161 3.60842 3.03202C3.33594 3.5668 3.33594 4.26686 3.33594 5.66699V14.3337C3.33594 15.7338 3.33594 16.4339 3.60842 16.9686C3.8481 17.439 4.23056 17.8215 4.70096 18.0612C5.23574 18.3337 5.93581 18.3337 7.33594 18.3337H10.0026M11.6693 9.16699H6.66927M8.33594 12.5003H6.66927M13.3359 5.83366H6.66927M12.0859 15.8337L13.7526 17.5003L17.5026 13.7503" stroke={iconColor(active)} strokeWidth="2.004" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    labelKey: 'nav.frequencia',
    route: '/(main)/historico',
    icon: (active) => (
      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <Path d="M12.0807 15.8337L13.7474 17.5003L17.4974 13.7503M18.3183 10.4586C18.3266 10.3069 18.3307 10.1541 18.3307 10.0003C18.3307 5.39795 14.5998 1.66699 9.9974 1.66699C5.39502 1.66699 1.66406 5.39795 1.66406 10.0003C1.66406 14.5298 5.27782 18.2153 9.77947 18.3309M9.9974 5.00033V10.0003L13.1127 11.558" stroke={iconColor(active)} strokeWidth="2.004" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    labelKey: 'nav.aulas',
    route: '/(main)/agenda',
    icon: (active) => (
      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <Path d="M17.5 8.33366H2.5M13.3333 1.66699V5.00033M6.66667 1.66699V5.00033M6.5 18.3337H13.5C14.9001 18.3337 15.6002 18.3337 16.135 18.0612C16.6054 17.8215 16.9878 17.439 17.2275 16.9686C17.5 16.4339 17.5 15.7338 17.5 14.3337V7.33366C17.5 5.93353 17.5 5.23346 17.2275 4.69868C16.9878 4.22828 16.6054 3.84583 16.135 3.60614C15.6002 3.33366 14.9001 3.33366 13.5 3.33366H6.5C5.09987 3.33366 4.3998 3.33366 3.86502 3.60614C3.39462 3.84583 3.01217 4.22828 2.77248 4.69868C2.5 5.23346 2.5 5.93353 2.5 7.33366V14.3337C2.5 15.7338 2.5 16.4339 2.77248 16.9686C3.01217 17.439 3.39462 17.8215 3.86502 18.0612C4.3998 18.3337 5.09987 18.3337 6.5 18.3337Z" stroke={iconColor(active)} strokeWidth="2.004" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    labelKey: 'nav.diario',
    route: '/(main)/diario',
    icon: (active) => (
      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <Path d="M11.6693 1.8916V5.33372C11.6693 5.80043 11.6693 6.03378 11.7601 6.21204C11.84 6.36885 11.9675 6.49633 12.1243 6.57622C12.3025 6.66705 12.5359 6.66705 13.0026 6.66705H16.4447M13.3359 10.8337H6.66927M13.3359 14.167H6.66927M8.33594 7.50033H6.66927M11.6693 1.66699H7.33594C5.93581 1.66699 5.23574 1.66699 4.70096 1.93948C4.23056 2.17916 3.8481 2.56161 3.60842 3.03202C3.33594 3.5668 3.33594 4.26686 3.33594 5.66699V14.3337C3.33594 15.7338 3.33594 16.4339 3.60842 16.9686C3.8481 17.439 4.23056 17.8215 4.70096 18.0612C5.23574 18.3337 5.93581 18.3337 7.33594 18.3337H12.6693C14.0694 18.3337 14.7695 18.3337 15.3042 18.0612C15.7747 17.8215 16.1571 17.439 16.3968 16.9686C16.6693 16.4339 16.6693 15.7338 16.6693 14.3337V6.66699L11.6693 1.66699Z" stroke={iconColor(active)} strokeWidth="2.004" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    labelKey: 'nav.mais',
    route: '/(main)/mais',
    icon: (active) => (
      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <Path d="M10.0026 10.8337C10.4628 10.8337 10.8359 10.4606 10.8359 10.0003C10.8359 9.54009 10.4628 9.16699 10.0026 9.16699C9.54237 9.16699 9.16927 9.54009 9.16927 10.0003C9.16927 10.4606 9.54237 10.8337 10.0026 10.8337Z" stroke={iconColor(active)} strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M15.8359 10.8337C16.2962 10.8337 16.6693 10.4606 16.6693 10.0003C16.6693 9.54009 16.2962 9.16699 15.8359 9.16699C15.3757 9.16699 15.0026 9.54009 15.0026 10.0003C15.0026 10.4606 15.3757 10.8337 15.8359 10.8337Z" stroke={iconColor(active)} strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M4.16927 10.8337C4.62951 10.8337 5.0026 10.4606 5.0026 10.0003C5.0026 9.54009 4.62951 9.16699 4.16927 9.16699C3.70903 9.16699 3.33594 9.54009 3.33594 10.0003C3.33594 10.4606 3.70903 10.8337 4.16927 10.8337Z" stroke={iconColor(active)} strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
];

const MAIS_ROUTE = '/(main)/mais';

const SECONDARY_LABEL_KEYS: Record<string, string> = {
  merenda: 'menu.merenda',
  livros: 'menu.livros',
  material: 'menu.material',
  dados: 'menu.dados',
};

const SPRING = { damping: 22, stiffness: 220, mass: 0.8 };

export default function Navbar() {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  const primaryRoutes = NAV_ITEMS.filter((i) => i.route !== MAIS_ROUTE).map((i) => i.route);
  const isOnPrimary = primaryRoutes.some((r) => pathname.includes(r.replace('/(main)/', '')));
  const secondaryLabelKey = !isOnPrimary
    ? Object.entries(SECONDARY_LABEL_KEYS).find(([key]) => pathname.includes(key))?.[1] ?? null
    : null;
  const secondaryLabel = secondaryLabelKey ? t(secondaryLabelKey) : null;

  const pillX = useSharedValue(-200);
  const pillWidth = useSharedValue(44);
  const initialized = useRef(false);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillWidth.value,
  }));

  function getActiveIndex() {
    return NAV_ITEMS.findIndex((item) => {
      const isMais = item.route === MAIS_ROUTE;
      return !isMais
        ? pathname.includes(item.route.replace('/(main)/', ''))
        : !!secondaryLabel;
    });
  }

  function handleItemLayout(index: number, e: LayoutChangeEvent) {
    if (index !== getActiveIndex()) return;
    const { x, width } = e.nativeEvent.layout;
    if (!initialized.current) {
      pillX.value = x;
      pillWidth.value = width;
      initialized.current = true;
    } else {
      pillX.value = withSpring(x, SPRING);
      pillWidth.value = withSpring(width, SPRING);
    }
  }

  return (
    <>
      <View style={[styles.outer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.inner}>
          <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />
          {NAV_ITEMS.map((item, index) => {
            const isMais = item.route === MAIS_ROUTE;
            const isActive = !isMais
              ? pathname.includes(item.route.replace('/(main)/', ''))
              : !!secondaryLabel;
            const label = isMais && secondaryLabel ? secondaryLabel : t(item.labelKey);

            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.item, isActive && styles.itemActive]}
                onLayout={(e) => handleItemLayout(index, e)}
                onPress={() => {
                  if (isMais) {
                    setMenuVisible(true);
                  } else {
                    router.replace(item.route as any);
                  }
                }}
                activeOpacity={0.8}
              >
                {item.icon(isActive)}
                {isActive && <Text style={styles.label}>{label}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <MenuSheet visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: colors.base.white,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inner: {
    backgroundColor: colors.brand[800],
    borderRadius: 48,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  pill: {
    position: 'absolute',
    top: 12,
    left: 0,
    height: 44,
    backgroundColor: colors.brand[600],
    borderRadius: 48,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 48,
  },
  itemActive: {
    flexDirection: 'row',
    gap: 6,
    width: 'auto',
    height: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    color: colors.brand[25],
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
