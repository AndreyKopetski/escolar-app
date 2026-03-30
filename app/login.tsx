import { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import AppLogo from '@/components/AppLogo';
import Button from '@/components/Button';
import { useApp } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';

const PROVEDORES = ['@gmail.com', '@hotmail.com', '@outlook.com'];
const TLDS = ['.com', '.com.br'];

const SCREEN_WIDTH = Dimensions.get('window').width;
const PATTERN_HEIGHT = 200;
const DOT_SPACING = 23;

export default function LoginScreen() {
  const router = useRouter();
  const { setUserEmail } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const toggleAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleRemember = () => {
    const next = !rememberMe;
    setRememberMe(next);
    Animated.timing(toggleAnim, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const thumbTranslate = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  function handleLogin() {
    const nomeUsuario = email.includes('@') ? email.split('@')[0] : email;
    setUserEmail(email || 'contato@gmail.com.br');
    router.replace({ pathname: '/(main)/boletim', params: { nome: nomeUsuario } });
  }

  const localPart = email.includes('@') ? email.split('@')[0] : email;
  const hasAt     = email.includes('@');
  const afterAt   = hasAt ? email.split('@')[1] ?? '' : '';
  const hasTld    = afterAt.includes('.');

  const endsWithCom     = email.endsWith('.com');
  const showProvedores  = emailFocused && localPart.length > 0 && !hasAt;
  const showTlds        = emailFocused && hasAt && !hasTld && afterAt.length > 0;
  const showBrSuffix    = emailFocused && endsWithCom;
  const showSuggestions = showProvedores || showTlds || showBrSuffix;

  const patternDots = useMemo(() => {
    const cols = Math.ceil(SCREEN_WIDTH / DOT_SPACING) + 2;
    const rows = Math.ceil(PATTERN_HEIGHT / DOT_SPACING) + 2;
    const dots = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        dots.push(
          <Circle
            key={`${row}-${col}`}
            cx={col * DOT_SPACING}
            cy={row * DOT_SPACING + 10}
            r={1}
            fill={colors.gray[300]}
          />
        );
      }
    }
    return dots;
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.patternWrapper} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={PATTERN_HEIGHT}>
          {patternDots}
        </Svg>
        <LinearGradient
          colors={['transparent', colors.base.white]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>

            {/* Logo */}
            <AppLogo size={64} />

            {/* Título */}
            <View style={styles.titleGroup}>
              <Text style={styles.title}>👋 Bem-vindo de volta!</Text>
              <Text style={styles.subtitle}>Informe seu e-mail e senha para acessar:</Text>
            </View>

            {/* Formulário */}
            <View style={styles.form}>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="Digite seu email"
                    placeholderTextColor={colors.gray[500]}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => {
                      if (blurTimeout.current) clearTimeout(blurTimeout.current);
                      setEmailFocused(true);
                    }}
                    onBlur={() => {
                      blurTimeout.current = setTimeout(() => setEmailFocused(false), 150);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {showSuggestions && (
                  <View style={styles.suggestions}>
                    {showProvedores && PROVEDORES.map((provedor) => (
                      <TouchableOpacity
                        key={provedor}
                        style={styles.suggestionPill}
                        onPress={() => {
                          setEmail(localPart + provedor);
                          inputRef.current?.focus();
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.suggestionText}>{localPart}{provedor}</Text>
                      </TouchableOpacity>
                    ))}
                    {showTlds && TLDS.map((tld) => (
                      <TouchableOpacity
                        key={tld}
                        style={styles.suggestionPill}
                        onPress={() => {
                          setEmail(email + tld);
                          inputRef.current?.focus();
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.suggestionText}>{email}{tld}</Text>
                      </TouchableOpacity>
                    ))}
                    {showBrSuffix && (
                      <TouchableOpacity
                        style={styles.suggestionPill}
                        onPress={() => {
                          setEmail(email + '.br');
                          inputRef.current?.focus();
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.suggestionText}>{email}.br</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Senha */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="••••••••"
                    placeholderTextColor={colors.gray[500]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? (
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke={colors.gray[500]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <Circle cx="12" cy="12" r="3" stroke={colors.gray[500]} strokeWidth="1.8" />
                      </Svg>
                    ) : (
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 2 12 2 12A18.09 18.09 0 0 1 5.06 7.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 22 12 22 12A18.09 18.09 0 0 1 19.92 15.92M9.9 9.9A3 3 0 0 0 14.12 14.12" stroke={colors.gray[500]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <Line x1="3" y1="3" x2="21" y2="21" stroke={colors.gray[500]} strokeWidth="1.8" strokeLinecap="round" />
                      </Svg>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Esqueci + Lembrar */}
              <View style={styles.extras}>
                <View style={styles.rememberRow}>
                  <TouchableOpacity
                    onPress={toggleRemember}
                    activeOpacity={0.9}
                    style={[styles.toggleTrack, rememberMe && styles.toggleTrackActive]}
                  >
                    <Animated.View
                      style={[styles.toggleThumb, { transform: [{ translateX: thumbTranslate }] }]}
                    />
                  </TouchableOpacity>
                  <Text style={styles.rememberText}>Lembrar</Text>
                </View>

                <Button label="Esqueci minha senha" variant="link" onPress={() => {}} />
              </View>

              {/* Botão Entrar */}
              <Button
                label="Entrar"
                size="xl"
                fullWidth
                onPress={handleLogin}
                leftIcon={
                  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                    <Path
                      d="M5 14.1667C5 14.9416 5 15.3291 5.08519 15.647C5.31635 16.5098 5.99022 17.1836 6.85295 17.4148C7.17087 17.5 7.55836 17.5 8.33333 17.5H13.5C14.9001 17.5 15.6002 17.5 16.135 17.2275C16.6054 16.9878 16.9878 16.6054 17.2275 16.135C17.5 15.6002 17.5 14.9001 17.5 13.5V6.5C17.5 5.09987 17.5 4.3998 17.2275 3.86502C16.9878 3.39462 16.6054 3.01217 16.135 2.77248C15.6002 2.5 14.9001 2.5 13.5 2.5H8.33333C7.55836 2.5 7.17087 2.5 6.85295 2.58519C5.99022 2.81635 5.31635 3.49022 5.08518 4.35295C5 4.67087 5 5.05836 5 5.83333M10 6.66667L13.3333 10M13.3333 10L10 13.3333M13.3333 10H2.5"
                      stroke="white"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                }
              />

            </View>
          </View>

          {/* Cadastro */}
          <View style={styles.cadastroRow}>
            <Text style={styles.cadastroText}>Ainda não possui conta?</Text>
            <Button label="Cadastre-se" variant="link" onPress={() => {}} />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.base.white,
  },
  patternWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PATTERN_HEIGHT,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  inner: {
    flex: 1,
    gap: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: {
    gap: 8,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.gray[900],
    textAlign: 'center',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[700],
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    gap: 24,
    width: '100%',
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.base.white,
    shadowColor: colors.gray[950],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputWrapperFocused: {
    borderColor: colors.brand[600],
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.gray[900],
  },
  inputFlex: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.gray[900],
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  suggestionPill: {
    backgroundColor: colors.base.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[700],
  },
  extras: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gray[300],
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: colors.brand[600],
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.base.white,
    shadowColor: colors.gray[950],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rememberText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[700],
  },
  cadastroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cadastroText: {
    fontSize: 14,
    color: colors.gray[500],
  },
});
