import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import ProfileSheet from '@/components/ProfileSheet';
import AlunoSelectSheet from '@/components/AlunoSelectSheet';
import { useApp } from '@/contexts/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { getBiometric } from '@/utils/biometrics';
import { useT } from '@/hooks/useT';

function MainLayoutInner() {
  const t = useT();
  const { hideHeader, activeStudent, hasBiometric, setHasBiometric } = useApp();
  const router = useRouter();

  useEffect(() => {
    getBiometric(activeStudent.id).then((entry) => setHasBiometric(!!entry));
  }, [activeStudent.id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[100] }} edges={['top']}>
      {!hideHeader && <Header />}
      {!hideHeader && !hasBiometric && (
        <TouchableOpacity
          style={styles.alertBiometria}
          onPress={() => router.push('/(main)/dados?view=biometria')}
          activeOpacity={0.8}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <Path
              d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke={colors.warning[600]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.alertText}>
            {t('layout.bioAlert')}{' '}
            <Text style={styles.alertLink}>{t('layout.bioLink')}</Text>
          </Text>
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 180,
          }}
        />
      </View>
      {!hideHeader && <Navbar />}
      <ProfileSheet />
      <AlunoSelectSheet />
    </SafeAreaView>
  );
}

export default function MainLayout() {
  return <MainLayoutInner />;
}

const styles = StyleSheet.create({
  alertBiometria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.warning[50],
    borderWidth: 1,
    borderColor: colors.warning[300],
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: colors.warning[800],
    lineHeight: 20,
  },
  alertLink: {
    fontWeight: '700',
    color: colors.warning[700],
  },
});
