import { useEffect } from 'react';
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
    labelKey: 'gestorNav.home',
    route: '/(gestor)/dashboard',
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
    labelKey: 'gestorNav.frequencia',
    route: '/(gestor)/frequencia',
    icon: (active: boolean) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={active ? colors.brand[25] : colors.brand[300]} strokeWidth="2" />
        <Path d="M12 7v5l3 3" stroke={active ? colors.brand[25] : colors.brand[300]} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    labelKey: 'gestorNav.agenda',
    route: '/(gestor)/agenda',
    icon: (active: boolean) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M8 2v3M16 2v3M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
          stroke={active ? colors.brand[25] : colors.brand[300]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    labelKey: 'gestorNav.relatorios',
    route: '/(gestor)/relatorios',
    icon: (active: boolean) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M9 12h6M9 16h4M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-5zM14 3v5h5"
          stroke={active ? colors.brand[25] : colors.brand[300]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    labelKey: 'gestorNav.alunos',
    route: '/(gestor)/alunos',
    icon: (active: boolean) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
          stroke={active ? colors.brand[25] : colors.brand[300]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="9" cy="7" r="4"
          stroke={active ? colors.brand[25] : colors.brand[300]} strokeWidth="2" />
        <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          stroke={active ? colors.brand[25] : colors.brand[300]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
];

function GestorNavbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const t        = useT();

  return (
    <View style={[styles.navOuter, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.navInner}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.includes(item.route.replace('/(gestor)/', ''));
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navItem, isActive && styles.navItemActive]}
              activeOpacity={0.8}
              onPress={() => router.push(item.route as any)}
            >
              {item.icon(isActive)}
              {isActive && <Text style={styles.navLabel}>{t(item.labelKey)}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function GestorLayout() {
  const { hideHeader, setProfilePhoto } = useApp();

  useEffect(() => {
    setProfilePhoto(require('@/assets/images/avatar-gestor.png'));
    return () => setProfilePhoto(null);
  }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[100] }} edges={['top']}>
      {!hideHeader && <Header showStudentSelector={false} notifRoute="/(gestor)/notificacoes" />}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 180 }} />
      </View>
      {!hideHeader && <GestorNavbar />}
      <ProfileSheet />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  navOuter: {
    backgroundColor: colors.base.white,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  navInner: {
    backgroundColor: colors.brand[800],
    borderRadius: 48,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  navItem: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 48,
  },
  navItemActive: {
    flexDirection: 'row',
    gap: 6,
    width: 'auto',
    height: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.brand[600],
  },
  navLabel: {
    color: colors.brand[25],
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
