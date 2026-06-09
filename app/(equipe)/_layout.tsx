import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import Header from '@/components/Header';
import ProfileSheet from '@/components/ProfileSheet';
import { useApp } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

const NAV_ITEMS = [
  {
    labelKey: 'equipeNav.inicio',
    route: '/(equipe)/inicio',
    icon: (active: boolean) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
          stroke={active ? colors.brand[25] : colors.brand[300]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9 21V12h6v9"
          stroke={active ? colors.brand[25] : colors.brand[300]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    labelKey: 'equipeNav.alimentacao',
    route: '/(equipe)/alimentacao',
    icon: (active: boolean) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"
          stroke={active ? colors.brand[25] : colors.brand[300]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    labelKey: 'equipeNav.restricoes',
    route: '/(equipe)/restricoes',
    icon: (active: boolean) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          stroke={active ? colors.brand[25] : colors.brand[300]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 9v4M12 17h.01"
          stroke={active ? colors.brand[25] : colors.brand[300]} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    ),
  },
];

function EquipeNavbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const t        = useT();

  return (
    <View style={[s.navOuter, { paddingBottom: insets.bottom + 24 }]}>
      <View style={s.navInner}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.includes(item.route.replace('/(equipe)/', ''));
          return (
            <TouchableOpacity
              key={item.route}
              style={[s.navItem, isActive && s.navItemActive]}
              activeOpacity={0.8}
              onPress={() => router.push(item.route as any)}
            >
              {item.icon(isActive)}
              {isActive && <Text style={s.navLabel}>{t(item.labelKey)}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function EquipeLayout() {
  const { hideHeader } = useApp();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[100] }} edges={['top']}>
      {!hideHeader && <Header showStudentSelector={false} disableNotif />}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 180 }} />
      </View>
      {!hideHeader && <EquipeNavbar />}
      <ProfileSheet />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  navOuter:  { backgroundColor: colors.base.white, paddingHorizontal: 16, paddingTop: 16 },
  navInner:  { backgroundColor: colors.brand[800], borderRadius: 48, paddingVertical: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' },
  navItem:   { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 48 },
  navItemActive: { flexDirection: 'row', gap: 6, width: 'auto', height: 'auto', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.brand[600] },
  navLabel:  { color: colors.brand[25], fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
