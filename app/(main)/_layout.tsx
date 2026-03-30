import { View } from 'react-native';
import { Stack } from 'expo-router';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import ProfileSheet from '@/components/ProfileSheet';
import AlunoSelectSheet from '@/components/AlunoSelectSheet';
import { useApp } from '@/contexts/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

function MainLayoutInner() {
  const { hideHeader } = useApp();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[100] }} edges={['top']}>
      {!hideHeader && <Header />}
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
