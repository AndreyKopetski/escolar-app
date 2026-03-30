import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AppLogo from '@/components/AppLogo';
import Button from '@/components/Button';
import { colors } from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <AppLogo size={64} />

        <View style={styles.textGroup}>
          <Text style={styles.title}>Que bom ter você aqui!</Text>
          <Text style={styles.subtitle}>
            Entre na sua conta e descubra tudo o que preparamos para facilitar o seu dia.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Entrar"
            size="2xl"
            fullWidth
            onPress={() => router.push('/login')}
          />
          <Button
            label="Primeiro acesso"
            variant="link"
            onPress={() => {}}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.base.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 56,
  },
  textGroup: {
    gap: 8,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
    textAlign: 'center',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[900],
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    gap: 32,
    alignItems: 'center',
    width: '100%',
  },
});
