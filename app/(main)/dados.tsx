import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Switch, Image, Animated, Easing, useWindowDimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { getBiometric, saveBiometric, removeBiometric } from '@/utils/biometrics';
import Svg, { Path, Circle, Ellipse, Rect as SvgRect, Defs, LinearGradient as SvgLinearGradient, Stop, G, Text as SvgText, ClipPath } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import Button from '@/components/Button';
import { colors, gradients } from '@/constants/colors';
import { useT } from '@/hooks/useT';

const STUDENT_PHOTOS: Record<string, number> = {
  TK: require('@/assets/images/avatar-thomas.jpg'),
  JK: require('@/assets/images/avatar-julia.jpg'),
};

// react-native-web's Animated forces `collapsable: false` into the props of any animated
// component (to keep the native driver from flattening views), but react-native-svg's web
// shapes forward unknown props straight to the DOM, where `collapsable` isn't a valid
// attribute. Strip it here before it reaches the underlying SVG element.
function RectNoCollapsable({ collapsable, ...rest }: any) {
  return <SvgRect {...rest} />;
}
function GNoCollapsable({ collapsable, ...rest }: any) {
  return <G {...rest} />;
}

const AnimatedSvgRect = Animated.createAnimatedComponent(RectNoCollapsable);
const AnimatedSvgG = Animated.createAnimatedComponent(GNoCollapsable);

const BINARY_SEED = '01101001011010010110010101100101011000010110110001110101011011100110111101101001011000010110111001101111011001010110100101100001011011100110111101100101';

// Single-space between every digit — matches reference image pattern
function getBinaryRow(index: number): string {
  const offset = (index * 17) % BINARY_SEED.length;
  let row = '';
  for (let i = 0; i < 90; i++) {
    row += BINARY_SEED[(offset + i) % BINARY_SEED.length] + ' ';
  }
  return row;
}

// ─── Types ────────────────────────────────────────────────

type ViewState = 'home' | 'basicas' | 'basicas-edit' | 'medica' | 'medica-edit' | 'biometria';
type BiometriaPhase = 'idle' | 'scanning' | 'success';

interface InfoBasicas {
  nome: string;
  cpf: string;
  dataNascimento: string;
  genero: string;
  matricula: string;
  dataMatricula: string;
}

interface FichaMedica {
  altura: string;
  peso: string;
  tipoSanguineo: string;
  carteiraSUS: string;
  contatoEmergencia: string;
  nomeContatoEmergencia: string;
  hospitalEmergencia: string;
  neurodivergente: boolean;
  pcd: boolean;
  alergicaMedicamento: string | null;
  alergicaAlimento: string | null;
  doencaCongenita: string | null;
  fumante: string | null;
  caxumba: string | null;
}

// ─── Dados ───────────────────────────────────────────────

const INITIAL_BASICAS: InfoBasicas = {
  nome: 'João Oliveira',
  cpf: '123.456.789-89',
  dataNascimento: '24/08/2007',
  genero: 'Masculino',
  matricula: '123456',
  dataMatricula: '02/02/2025',
};

const INITIAL_MEDICA: FichaMedica = {
  altura: '1,50',
  peso: '65',
  tipoSanguineo: 'A+',
  carteiraSUS: '123456789',
  contatoEmergencia: '(42) 98765-4321',
  nomeContatoEmergencia: '',
  hospitalEmergencia: 'Hospital da Criança',
  neurodivergente: true,
  pcd: false,
  alergicaMedicamento: null,
  alergicaAlimento: null,
  doencaCongenita: null,
  fumante: null,
  caxumba: null,
};

const TIPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDER_KEYS = ['alunoData.genderMale', 'alunoData.genderFemale', 'alunoData.genderNonBinary', 'alunoData.genderNoInfo'];

const CAPTURE_STEPS = [
  { labelKey: 'alunoData.front',     instructionKey: 'alunoData.bioInstructFront' },
  { labelKey: 'alunoData.leftSide',  instructionKey: 'alunoData.bioInstructLeft' },
  { labelKey: 'alunoData.rightSide', instructionKey: 'alunoData.bioInstructRight' },
];

// ─── Sub-components ───────────────────────────────────────

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.subHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
      <Text style={styles.subHeaderTitle}>{title}</Text>
      <View style={{ width: 32 }} />
    </View>
  );
}

function TableRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.tableRow, !last && styles.tableRowBorder]}>
      <Text style={styles.tableLabel}>{label}</Text>
      <Text style={styles.tableValue}>{value || '---'}</Text>
    </View>
  );
}

function FormField({ label, value, onChangeText, placeholder, required }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const t = useT();
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label}{required && <Text style={styles.fieldRequired}> *</Text>}
      </Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? t('common.writeHere')}
        placeholderTextColor={colors.gray[400]}
      />
    </View>
  );
}

function SelectField({ label, value, options, onSelect }: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}{<Text style={styles.fieldRequired}> *</Text>}</Text>
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text style={[styles.selectText, !value && styles.selectPlaceholder]}>
          {value || t('common.select')}
        </Text>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M6 9l6 6 6-6" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
      {open && (
        <View style={styles.selectOptions}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.selectOption}
              onPress={() => { onSelect(opt); setOpen(false); }}
            >
              <Text style={[styles.selectOptionText, opt === value && styles.selectOptionActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function BottomActions({ onCancel, onSave, cancelLabel, saveLabel }: { onCancel: () => void; onSave: () => void; cancelLabel: string; saveLabel: string }) {
  return (
    <View style={styles.bottomActions}>
      <Button label={cancelLabel} variant="secondary-gray" onPress={onCancel} style={{ flex: 1 }} />
      <Button
        label={saveLabel}
        onPress={onSave}
        style={{ flex: 1 }}
        leftIcon={
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M17 21v-8H7v8M7 3v5h8M5 3h11l3 3v13a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke={colors.base.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        }
      />
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────

export default function DadosScreen() {
  const t = useT();
  const generos = GENDER_KEYS.map(k => t(k));
  const router = useRouter();
  const { view } = useLocalSearchParams<{ view?: string }>();
  const { setHideHeader, activeStudent, setActiveStudent, setHasBiometric } = useApp();
  const { width: windowWidth } = useWindowDimensions();
  const [viewState, setViewState] = useState<ViewState>(view === 'biometria' ? 'biometria' : 'home');

  const activePhoto = activeStudent.foto ?? STUDENT_PHOTOS[activeStudent.iniciais];

  const [basicas, setBasicas] = useState<InfoBasicas>({ ...INITIAL_BASICAS, nome: activeStudent.nome });
  const [editBasicas, setEditBasicas] = useState<InfoBasicas>({ ...INITIAL_BASICAS, nome: activeStudent.nome });

  const [medica, setMedica] = useState<FichaMedica>(INITIAL_MEDICA);
  const [editMedica, setEditMedica] = useState<FichaMedica>(INITIAL_MEDICA);

  const [faceCode, setFaceCode] = useState<string | null>(null);
  const [biometriaPhase, setBiometriaPhase] = useState<BiometriaPhase>('idle');
  const [captureStep, setCaptureStep] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showStepSuccess, setShowStepSuccess] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const captureFlashAnim = useRef(new Animated.Value(0)).current;
  const guideAnim = useRef(new Animated.Value(0)).current;
  const faceScanAnim = useRef(new Animated.Value(0)).current;
  const faceScanIconOpacity = useRef(new Animated.Value(0)).current;
  const faceScannerY = faceScanAnim.interpolate({ inputRange: [0, 1], outputRange: [-28, 258] });
  const handleCaptureRef = useRef<() => Promise<void>>(async () => {});
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    setHideHeader(true);
  }, []);

  useEffect(() => () => { setHideHeader(false); }, []);

  useEffect(() => {
    if (biometriaPhase !== 'scanning') {
      scanAnim.stopAnimation();
      scanAnim.setValue(0);
      guideAnim.stopAnimation();
      guideAnim.setValue(0);
      setCaptureStep(0);
      return;
    }
    scanAnim.setValue(0);
    Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 2200, useNativeDriver: true })
    ).start();
  }, [biometriaPhase]);

  useEffect(() => {
    if (biometriaPhase !== 'scanning') return;
    guideAnim.stopAnimation();
    guideAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(guideAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.delay(250),
        Animated.timing(guideAnim, { toValue: 0, duration: 750, useNativeDriver: true }),
        Animated.delay(400),
      ])
    ).start();
  }, [captureStep, biometriaPhase]);

  // ── Idle face scanner animation ───────────────────────────
  useEffect(() => {
    if (biometriaPhase !== 'idle') {
      faceScanAnim.stopAnimation();
      faceScanIconOpacity.stopAnimation();
      faceScanAnim.setValue(0);
      faceScanIconOpacity.setValue(0);
      return;
    }
    faceScanAnim.setValue(0);
    faceScanIconOpacity.setValue(0);
    const anim = Animated.loop(
      Animated.sequence([
        // Scan sweeps top → bottom
        Animated.timing(faceScanAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: false }),
        // Badge fades in
        Animated.timing(faceScanIconOpacity, { toValue: 1, duration: 500, useNativeDriver: false }),
        // Hold badge visible (timing to same value = delay sem Animated.delay)
        Animated.timing(faceScanIconOpacity, { toValue: 1, duration: 1200, useNativeDriver: false }),
        // Badge fades out
        Animated.timing(faceScanIconOpacity, { toValue: 0, duration: 400, useNativeDriver: false }),
        // Reset scan posição before next loop
        Animated.timing(faceScanAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [biometriaPhase]);

  // Contagem regressiva automática — dispara handleCapture ao chegar em 0
  useEffect(() => {
    if (biometriaPhase !== 'scanning' || !permission?.granted || isCapturing) {
      setCountdown(null);
      return;
    }
    setCountdown(3);
    const t1 = setTimeout(() => setCountdown(2), 1000);
    const t2 = setTimeout(() => setCountdown(1), 2000);
    const t3 = setTimeout(() => {
      setCountdown(null);
      handleCaptureRef.current();
    }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [captureStep, biometriaPhase, permission?.granted, isCapturing]);

  useEffect(() => {
    getBiometric(activeStudent.id).then((entry) => {
      if (entry) setFaceCode(entry.code);
    });
  }, [activeStudent.id]);

  async function handleCapture() {
    if (isCapturing) return;
    setIsCapturing(true);

    const isLastStep = captureStep === CAPTURE_STEPS.length - 1;

    // Captura e descarta imagem (sem tocar no scanAnim para evitar race condition com native driver)
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.1, skipProcessing: true });
        if (photo?.uri) await FileSystem.deleteAsync(photo.uri, { idempotent: true });
      }
    } catch { /* câmera indisponível no web */ }

    // Flash verde de confirmação (scanAnim continua rodando normalmente)
    captureFlashAnim.setValue(0);
    Animated.sequence([
      Animated.timing(captureFlashAnim, { toValue: 0.6, duration: 200, useNativeDriver: true }),
      Animated.delay(500),
      Animated.timing(captureFlashAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();

    // Após o flash, exibe mensagem de sucesso do step (para steps intermediários)
    setTimeout(async () => {
      if (!isLastStep) {
        // Mostra overlay de sucesso por 1,6s antes de avançar
        setShowStepSuccess(true);
        setTimeout(() => {
          setShowStepSuccess(false);
          setIsCapturing(false);
          setCaptureStep((s) => s + 1);
        }, 1600);
      } else {
        setIsCapturing(false);
        const hex = '0123456789abcdef';
        const rand = Array.from({ length: 24 }, () => hex[Math.floor(Math.random() * 16)]).join('');
        const code = `${Date.now().toString(16)}${rand}`.slice(0, 40);
        await saveBiometric({
          studentId: activeStudent.id,
          studentName: activeStudent.nome,
          code,
          enrolledAt: new Date().toISOString(),
        });
        setFaceCode(code);
        setHasBiometric(true);
        setBiometriaPhase('success');
      }
    }, 1100);
  }

  handleCaptureRef.current = handleCapture;

  async function handleRemoveBiometric() {
    await removeBiometric(activeStudent.id);
    setFaceCode(null);
    setHasBiometric(false);
  }

  // ── Home ──
  if (viewState === 'home') {
    return (
      <View style={styles.containerDetail}>
        {/* Sub-header */}
        <SubHeader title={t('alunoData.title')} onBack={() => router.canGoBack() ? router.back() : router.replace('/(main)/boletim')} />

        <View style={styles.detailBody}>
        <View style={styles.whiteCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Info */}
          <View style={styles.profileInfo}>
            <View style={styles.profileRow}>
              <LinearGradient
                colors={gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileAvatarBorder}
              >
                <Image source={activePhoto} style={styles.profileAvatarImage} />
              </LinearGradient>
              <View style={styles.profileTextGroup}>
                <Text style={styles.profileName}>{basicas.nome}</Text>
                <View style={styles.badgesRow}>
                  <View style={styles.badgeBlue}>
                    <Text style={styles.badgeBlueText}>{t('alunoData.classA')}</Text>
                  </View>
                  {medica.neurodivergente && (
                    <View style={styles.badgeViolet}>
                      <Text style={styles.badgeVioletText}>{t('alunoData.neurodivergent')}</Text>
                    </View>
                  )}
                  {medica.pcd && (
                    <View style={styles.badgeOrange}>
                      <Text style={styles.badgeOrangeText}>{t('alunoData.pcd').split(' ')[0]}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Alert biometria pendente */}
          {!faceCode && (
            <View style={styles.alertBiometria}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <Path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke={colors.warning[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.alertBiometriaText}>
                {t('alunoData.bioAlertText')}
              </Text>
            </View>
          )}

          {/* Menu items */}
          <View style={styles.menuList}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setViewState('basicas')}
              activeOpacity={0.8}
            >
              <Text style={styles.menuItemText}>{t('alunoData.basicInfo')}</Text>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M9 18l6-6-6-6" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setViewState('medica')}
              activeOpacity={0.8}
            >
              <Text style={styles.menuItemText}>{t('alunoData.medical')}</Text>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M9 18l6-6-6-6" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setViewState('biometria')}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemText}>{t('alunoData.biometrics')}</Text>
                {faceCode ? (
                  <View style={styles.badgeOk}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                      <Path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        stroke={colors.success[600]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={styles.badgeOkText}>{t('common.registered')}</Text>
                  </View>
                ) : (
                  <View style={styles.badgePending}>
                    <Text style={styles.badgePendingText}>{t('common.pending')}</Text>
                  </View>
                )}
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M9 18l6-6-6-6" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
        </ScrollView>
        </View>
        </View>
      </View>
    );
  }

  // ── Biometria Facial ──
  if (viewState === 'biometria') {
    return (
      <View style={styles.containerDetail}>
        <SubHeader
          title={t('alunoData.biometrics')}
          onBack={() => { setBiometriaPhase('idle'); setViewState('home'); }}
        />
        <View style={styles.detailBody}>
        <View style={styles.whiteCard}>

          {/* ── Idle ── */}
          {biometriaPhase === 'idle' && (
            <>
              <ScrollView contentContainerStyle={styles.biometriaIdleScroll} showsVerticalScrollIndicator={false}>

                {/* Binary face visualization */}
                <View style={[styles.biometriaFaceVizContainer, { width: windowWidth, height: windowWidth }]}>
                  <Image
                    source={require('@/assets/images/face-binary.png.png')}
                    style={{ width: windowWidth, height: windowWidth }}
                    resizeMode="cover"
                  />

                  {/* Scanner + badge overlay — mesmo espaço de coordenadas da imagem */}
                  <Svg
                    width={windowWidth}
                    height={windowWidth}
                    viewBox="0 0 240 240"
                    style={styles.biometriaScanOverlay}
                  >
                    <Defs>
                      <SvgLinearGradient id="faceScanGreen" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0"   stopColor="#00E554" stopOpacity="0" />
                        <Stop offset="0.3" stopColor="#00E554" stopOpacity="0.22" />
                        <Stop offset="0.5" stopColor="#00E554" stopOpacity="0.9" />
                        <Stop offset="0.7" stopColor="#00E554" stopOpacity="0.22" />
                        <Stop offset="1"   stopColor="#00E554" stopOpacity="0" />
                      </SvgLinearGradient>
                      <SvgLinearGradient id="faceScanRed" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0"   stopColor="#F97066" stopOpacity="0" />
                        <Stop offset="0.3" stopColor="#F97066" stopOpacity="0.22" />
                        <Stop offset="0.5" stopColor="#F97066" stopOpacity="0.9" />
                        <Stop offset="0.7" stopColor="#F97066" stopOpacity="0.22" />
                        <Stop offset="1"   stopColor="#F97066" stopOpacity="0" />
                      </SvgLinearGradient>
                    </Defs>

                    {/* Scanner sweep — percorre a imagem inteira */}
                    <AnimatedSvgRect
                      x="0"
                      y={faceScannerY}
                      width="240"
                      height="52"
                      fill={faceCode ? 'url(#faceScanGreen)' : 'url(#faceScanRed)'}
                    />

                    {/* Liquid glass badge — fades in after each scan pass */}
                    <AnimatedSvgG opacity={faceScanIconOpacity}>
                      <Circle cx="120" cy="120" r="58" fill={faceCode ? '#00E554' : colors.error[400]} opacity={0.06} />
                      <Circle cx="120" cy="120" r="46" fill={faceCode ? '#00E554' : colors.error[400]} opacity={0.09} />
                      <G transform="translate(120, 120) scale(0.73) translate(-59, -56)">
                        <SvgRect x="11.5" y="10" width="95" height="92" rx="46"
                          fill={faceCode ? '#5CAC75' : colors.error[400]}
                          fillOpacity={faceCode ? 0.28 : 0.18} />
                        <SvgRect x="11.5" y="10" width="95" height="92" rx="46"
                          fill="#FFFFFF" fillOpacity={faceCode ? 0.12 : 0.1} />
                        <Path d="M 30 22 Q 59 14 88 22"
                          stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        <SvgRect x="12" y="10.5" width="94" height="91" rx="45.5"
                          stroke="rgba(255,255,255,0.32)" strokeWidth="1" fill="none" />
                        <Path d="M 30 88 Q 59 97 88 88"
                          stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none" strokeLinecap="round" />
                        {faceCode ? (
                          <Path
                            d="M54.6929 56.1366L57.5717 59.0154L64.049 52.5381M54.9836 68.5167C55.4553 68.4543 55.9319 68.5822 56.3077 68.8717L58.0396 70.2007C58.6121 70.6405 59.4085 70.6405 59.9794 70.2007L61.7769 68.8205C62.1128 68.563 62.5365 68.4495 62.9555 68.5055L65.204 68.8013C65.9188 68.8957 66.6081 68.4975 66.8848 67.8306L67.7499 65.7387C67.9114 65.3469 68.2217 65.0366 68.6135 64.8751L70.7052 64.0099C71.3721 63.7348 71.7703 63.0439 71.6759 62.329L71.3913 60.162C71.3289 59.6902 71.4568 59.2136 71.7463 58.8378L73.0752 57.1058C73.515 56.5332 73.515 55.7368 73.0752 55.1658L71.6951 53.3683C71.4377 53.0324 71.3241 52.6086 71.3801 52.1896L71.6759 49.941C71.7703 49.2261 71.3721 48.5368 70.7052 48.2602L68.6135 47.3949C68.2217 47.2334 67.9114 46.9232 67.7499 46.5313L66.8848 44.4395C66.6097 43.7726 65.9188 43.3743 65.204 43.4687L62.9555 43.7646C62.5365 43.8221 62.1128 43.7086 61.7785 43.4527L59.981 42.0725C59.4085 41.6327 58.6121 41.6327 58.0412 42.0725L56.2437 43.4527C55.9079 43.7086 55.4841 43.8221 55.0651 43.7678L52.8167 43.4719C52.1018 43.3775 51.4126 43.7758 51.1359 44.4427L50.2723 46.5345C50.1092 46.9247 49.799 47.235 49.4088 47.3981L47.317 48.2618C46.6502 48.5384 46.252 49.2277 46.3463 49.9426L46.6422 52.1912C46.6965 52.6102 46.583 53.034 46.3271 53.3683L44.947 55.1658C44.5072 55.7384 44.5072 56.5348 44.947 57.1058L46.3271 58.9034C46.5846 59.2392 46.6981 59.663 46.6422 60.082L46.3463 62.3306C46.252 63.0455 46.6502 63.7348 47.317 64.0115L49.4088 64.8767C49.8006 65.0382 50.1108 65.3485 50.2723 65.7403L51.1375 67.8322C51.4126 68.4991 52.1034 68.8973 52.8183 68.8029L54.9836 68.5167Z"
                            stroke="#008B00" strokeWidth="2.87879"
                            strokeLinecap="round" strokeLinejoin="round" fill="none"
                          />
                        ) : (
                          <Path
                            d="M 50 47 L 68 65 M 68 47 L 50 65"
                            stroke={colors.error[500]} strokeWidth="3.5"
                            strokeLinecap="round" fill="none"
                          />
                        )}
                      </G>
                    </AnimatedSvgG>
                  </Svg>
                </View>

                <View style={styles.biometriaIdleTextGroup}>
                  {/* Title */}
                  <Text style={styles.biometriaIdleTitle}>
                    {faceCode ? t('alunoData.bioRegistered') : t('alunoData.bioNone')}
                  </Text>

                  {/* Subtitle / ID */}
                  <Text style={styles.biometriaIdleSubtitle}>
                    {faceCode
                      ? `ID: ${faceCode.slice(0, 16)}...`
                      : t('alunoData.bioScanPrompt')}
                  </Text>

                  {/* Info card */}
                  <View style={styles.biometriaInfoCard}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M12 22C17.523 22 22 17.523 22 12S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM11 12h1v4h1M12 8h.01"
                        stroke={colors.blue[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={styles.biometriaInfoText}>
                      {t('alunoData.bioInfo')}
                    </Text>
                  </View>
                </View>

              </ScrollView>

              <View style={styles.biometriaFixedBottom}>
                <Button
                  variant={faceCode ? 'secondary' : 'primary'}
                  label={faceCode ? t('alunoData.bioReRegister') : t('alunoData.bioRegister')}
                  onPress={() => setBiometriaPhase('scanning')}
                  fullWidth
                  leftIcon={
                    <Svg width={18} height={18} viewBox="0 0 40 40" fill="none">
                      <Path d="M5 13 L5 6 L12 6" stroke={faceCode ? colors.brand[700] : colors.base.white} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <Path d="M28 6 L35 6 L35 13" stroke={faceCode ? colors.brand[700] : colors.base.white} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <Path d="M5 27 L5 34 L12 34" stroke={faceCode ? colors.brand[700] : colors.base.white} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <Path d="M28 34 L35 34 L35 27" stroke={faceCode ? colors.brand[700] : colors.base.white} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <Circle cx="15" cy="18" r="2.5" fill={faceCode ? colors.brand[700] : colors.base.white} />
                      <Circle cx="25" cy="18" r="2.5" fill={faceCode ? colors.brand[700] : colors.base.white} />
                      <Path d="M13 26 Q20 31 27 26" stroke={faceCode ? colors.brand[700] : colors.base.white} strokeWidth="2" fill="none" strokeLinecap="round" />
                    </Svg>
                  }
                />
                {faceCode && (
                  <TouchableOpacity style={styles.biometriaRemoveBtn} onPress={handleRemoveBiometric} activeOpacity={0.7}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                        stroke={colors.gray[500]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={styles.biometriaRemoveBtnText}>{t('alunoData.bioRemove')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* ── Scanning ── */}
          {biometriaPhase === 'scanning' && (
            <>
              <View style={styles.biometriaScanContainer}>
                <Text style={styles.biometriaScanTitle}>{t('alunoData.bioStart')}</Text>

                {/* Indicador de etapas */}
                {permission?.granted && (
                  <>
                    <View style={styles.stepRow}>
                      {CAPTURE_STEPS.map((step, idx) => (
                        <View key={idx} style={styles.stepItemWrapper}>
                          {/* Metade esquerda da linha */}
                          {idx > 0 && (
                            <View style={[styles.stepLineHalf, styles.stepLineLeft,
                              captureStep >= idx && styles.stepLineDone]} />
                          )}
                          {/* Metade direita da linha */}
                          {idx < CAPTURE_STEPS.length - 1 && (
                            <View style={[styles.stepLineHalf, styles.stepLineRight,
                              captureStep > idx && styles.stepLineDone]} />
                          )}
                          <View style={[
                            styles.stepCircle,
                            idx < captureStep && styles.stepCircleDone,
                            idx === captureStep && styles.stepCircleActive,
                          ]}>
                            {idx < captureStep ? (
                              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                <Path d="M5 13l4 4L19 7" stroke={colors.base.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              </Svg>
                            ) : (
                              <Text style={[styles.stepCircleText, idx === captureStep && styles.stepCircleTextActive]}>
                                {idx + 1}
                              </Text>
                            )}
                          </View>
                          <Text style={[styles.stepLabel, idx === captureStep && styles.stepLabelActive]}>
                            {t(step.labelKey)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                <Text style={styles.biometriaScanInstruction}>
                  {!permission?.granted
                    ? t('alunoData.cameraPermission')
                    : t(CAPTURE_STEPS[captureStep].instructionKey)}
                </Text>

                {/* Guia animado de posição do rosto */}
                {permission?.granted && (
                  <View style={styles.faceGuideRow}>
                    {/* Seta esquerda */}
                    <View style={styles.faceGuideArrowSlot}>
                      {captureStep === 1 && (
                        <Animated.View style={{ opacity: guideAnim }}>
                          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                            <Path d="M19 12H5M5 12L12 19M5 12L12 5"
                              stroke={colors.brand[500]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        </Animated.View>
                      )}
                    </View>

                    {/* Rosto animado */}
                    <Animated.View style={{
                      transform: captureStep === 0
                        ? [{ scale: guideAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }]
                        : captureStep === 1
                          ? [
                              { scaleX: guideAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] }) },
                              { translateX: guideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
                            ]
                          : [
                              { scaleX: guideAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] }) },
                              { translateX: guideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 14] }) },
                            ],
                    }}>
                      <Svg width={64} height={80} viewBox="0 0 64 80">
                        {/* Cabeça */}
                        <Ellipse cx="32" cy="40" rx="23" ry="30"
                          stroke={colors.brand[400]} strokeWidth="2.5" fill={colors.brand[25]} />
                        {/* Olho esquerdo */}
                        <Circle cx="23" cy="33" r="3.5" fill={colors.brand[500]} />
                        {/* Olho direito */}
                        <Circle cx="41" cy="33" r="3.5" fill={colors.brand[500]} />
                        {/* Nariz */}
                        <Path d="M32 39 L29 46 L35 46"
                          stroke={colors.brand[400]} strokeWidth="1.5" fill="none"
                          strokeLinecap="round" strokeLinejoin="round" />
                        {/* Boca */}
                        <Path d="M25 56 Q32 61 39 56"
                          stroke={colors.brand[400]} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </Svg>
                    </Animated.View>

                    {/* Seta direita */}
                    <View style={styles.faceGuideArrowSlot}>
                      {captureStep === 2 && (
                        <Animated.View style={{ opacity: guideAnim }}>
                          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                            <Path d="M5 12H19M19 12L12 19M19 12L12 5"
                              stroke={colors.brand[500]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        </Animated.View>
                      )}
                    </View>
                  </View>
                )}

                {permission?.granted && (
                  <View style={styles.cameraFrame}>
                    <CameraView ref={cameraRef} facing="front" style={StyleSheet.absoluteFillObject} />
                    {/* Cantos da moldura */}
                    <Svg width={240} height={300} style={{ position: 'absolute', top: 0, left: 0 }}>
                      <Path d="M20 55 L20 20 L55 20" stroke={colors.brand[300]} strokeWidth="4" strokeLinecap="round" fill="none" />
                      <Path d="M185 20 L220 20 L220 55" stroke={colors.brand[300]} strokeWidth="4" strokeLinecap="round" fill="none" />
                      <Path d="M20 245 L20 280 L55 280" stroke={colors.brand[300]} strokeWidth="4" strokeLinecap="round" fill="none" />
                      <Path d="M185 280 L220 280 L220 245" stroke={colors.brand[300]} strokeWidth="4" strokeLinecap="round" fill="none" />
                    </Svg>
                    {/* Pontos de referência facial */}
                    <Svg width={240} height={300} style={{ position: 'absolute', top: 0, left: 0 }}>
                      <Circle cx="86"  cy="122" r="3" fill={colors.brand[300]} opacity={0.9} />
                      <Circle cx="154" cy="122" r="3" fill={colors.brand[300]} opacity={0.9} />
                      <Circle cx="120" cy="158" r="3" fill={colors.brand[300]} opacity={0.9} />
                      <Circle cx="99"  cy="188" r="3" fill={colors.brand[300]} opacity={0.9} />
                      <Circle cx="141" cy="188" r="3" fill={colors.brand[300]} opacity={0.9} />
                      <Circle cx="120" cy="70"  r="2" fill={colors.brand[300]} opacity={0.5} />
                      <Circle cx="72"  cy="98"  r="2" fill={colors.brand[300]} opacity={0.5} />
                      <Circle cx="168" cy="98"  r="2" fill={colors.brand[300]} opacity={0.5} />
                      <Circle cx="62"  cy="152" r="2" fill={colors.brand[300]} opacity={0.5} />
                      <Circle cx="178" cy="152" r="2" fill={colors.brand[300]} opacity={0.5} />
                      <Circle cx="120" cy="218" r="2" fill={colors.brand[300]} opacity={0.5} />
                    </Svg>
                    {/* Linha de scan */}
                    <Animated.View
                      style={[styles.scanLine, {
                        transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 298] }) }],
                      }]}
                    />
                    {/* Flash de confirmação */}
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        StyleSheet.absoluteFillObject,
                        { backgroundColor: colors.success[400], opacity: captureFlashAnim },
                      ]}
                    />
                    {/* Contagem regressiva */}
                    {countdown !== null && countdown > 0 && (
                      <View style={styles.countdownOverlay}>
                        <View style={styles.countdownCircle}>
                          <Text style={styles.countdownNumber}>{countdown}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.biometriaFixedBottom}>
                {!permission?.granted && (
                  <Button label={t('alunoData.allowCamera')} onPress={requestPermission} />
                )}
                {permission?.granted && (
                  <View style={styles.captureStatusRow}>
                    {isCapturing ? (
                      <Text style={styles.captureStatusText}>{t('alunoData.processing')}</Text>
                    ) : countdown !== null ? (
                      <Text style={styles.captureStatusText}>
                        {t('alunoData.captureAutoPre')}<Text style={styles.captureStatusBold}>{countdown}s</Text>
                      </Text>
                    ) : null}
                  </View>
                )}
                <Button label={t('alunoData.bioCancel')} variant="secondary-gray" onPress={() => setBiometriaPhase('idle')} />
              </View>
            </>
          )}

          {/* ── Step success overlay ── */}
          {showStepSuccess && (
            <View style={styles.stepSuccessOverlay}>
              <View style={styles.stepSuccessIconCircle}>
                <Svg width={52} height={52} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke={colors.success[500]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={styles.stepSuccessTitle}>
                {CAPTURE_STEPS[captureStep] ? t('alunoData.stepCaptured', { label: t(CAPTURE_STEPS[captureStep].labelKey) }) : ''}
              </Text>
              <Text style={styles.stepSuccessSubtitle}>
                {captureStep === 0 ? t('alunoData.stepTurnLeft') : t('alunoData.stepTurnRight')}
              </Text>
            </View>
          )}

          {/* ── Success ── */}
          {biometriaPhase === 'success' && (
            <>
              <View style={styles.biometriaSuccessContainer}>
                <View style={styles.biometriaSuccessIcon}>
                  <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
                    <Path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke={colors.success[500]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={styles.biometriaSuccessTitle}>{t('alunoData.bioSuccess')}</Text>
                <Text style={styles.biometriaSuccessSubtitle}>
                  {t('alunoData.bioSuccessSub')}
                </Text>
                <View style={styles.biometriaCodeCard}>
                  <Text style={styles.biometriaCodeLabel}>{t('alunoData.bioCode')}</Text>
                  <Text style={styles.biometriaCodeValue} numberOfLines={2}>{faceCode}</Text>
                </View>
              </View>
              <View style={styles.biometriaFixedBottom}>
                <Button label={t('alunoData.bioFinish')} onPress={() => setBiometriaPhase('idle')} />
              </View>
            </>
          )}

        </View>
        </View>
      </View>
    );
  }

  // ── Informações básicas ──
  if (viewState === 'basicas') {
    return (
      <View style={styles.containerDetail}>
        <SubHeader title={t('alunoData.basicInfo')} onBack={() => setViewState('home')} />
        <View style={styles.detailBody}>
        <View style={styles.whiteCard}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.table}>
            <TableRow label={t('alunoData.name')} value={basicas.nome} />
            <TableRow label={t('alunoData.cpf')} value={basicas.cpf} />
            <TableRow label={t('alunoData.birthDate')} value={basicas.dataNascimento} />
            <TableRow label={t('alunoData.gender')} value={basicas.genero} />
            <TableRow label={t('alunoData.enrollment')} value={basicas.matricula} />
            <TableRow label={t('alunoData.enrollmentDate')} value={basicas.dataMatricula} last />
          </View>
        </ScrollView>
        <View style={styles.singleAction}>
          <Button
            label={t('alunoData.editInfo')}
            variant="secondary"
            onPress={() => { setEditBasicas({ ...basicas }); setViewState('basicas-edit'); }}
            leftIcon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={colors.brand[600]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            }
          />
        </View>
        </View>
        </View>
      </View>
    );
  }

  // ── Editar informações básicas ──
  if (viewState === 'basicas-edit') {
    return (
      <View style={styles.containerDetail}>
        <View style={styles.editHeader}>
          <Text style={styles.editHeaderTitle}>{t('alunoData.basicInfo')}</Text>
        </View>
        <View style={styles.detailBody}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            <FormField
              label={t('alunoData.name')}
              value={editBasicas.nome}
              onChangeText={(v) => setEditBasicas({ ...editBasicas, nome: v })}
              required
            />
            <FormField
              label={t('alunoData.cpf')}
              value={editBasicas.cpf}
              onChangeText={(v) => setEditBasicas({ ...editBasicas, cpf: v })}
              required
            />
            <FormField
              label={t('alunoData.birthDate')}
              value={editBasicas.dataNascimento}
              onChangeText={(v) => setEditBasicas({ ...editBasicas, dataNascimento: v })}
              required
            />
            <SelectField
              label={t('alunoData.gender')}
              value={editBasicas.genero}
              options={generos}
              onSelect={(v) => setEditBasicas({ ...editBasicas, genero: v })}
            />
          </View>
        </ScrollView>
        <BottomActions
          onCancel={() => setViewState('basicas')}
          onSave={() => { setBasicas({ ...editBasicas }); setActiveStudent({ ...activeStudent, nome: editBasicas.nome }); setViewState('basicas'); }}
          cancelLabel={t('common.cancel')}
          saveLabel={t('common.save')}
        />
        </View>
      </View>
    );
  }

  // ── Ficha médica ──
  if (viewState === 'medica') {
    return (
      <View style={styles.containerDetail}>
        <SubHeader title={t('alunoData.medical')} onBack={() => setViewState('home')} />
        <View style={styles.detailBody}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.table}>
            <TableRow label={t('alunoData.height')} value={medica.altura} />
            <TableRow label={t('alunoData.weight')} value={medica.peso} />
            <TableRow label={t('alunoData.blood')} value={medica.tipoSanguineo} />
            <TableRow label={t('alunoData.sus')} value={medica.carteiraSUS} />
            <TableRow label={t('alunoData.emergencyContact')} value={medica.contatoEmergencia} />
            <TableRow label={t('alunoData.hospital')} value={medica.hospitalEmergencia} />
            <TableRow label={t('alunoData.neurodivergent')} value={medica.neurodivergente ? t('common.yes') : t('common.no')} />
            <TableRow label={t('alunoData.pcd')} value={medica.pcd ? t('common.yes') : t('common.no')} />
            <TableRow label={t('alunoData.medicAllergyMedShort')} value={medica.alergicaMedicamento ?? '---'} />
            <TableRow label={t('alunoData.medicAllergyFoodShort')} value={medica.alergicaAlimento ?? '---'} />
            <TableRow label={t('alunoData.medicCongenitalShort')} value={medica.doencaCongenita ?? '---'} />
            <TableRow label={t('alunoData.medicSmoker')} value={medica.fumante ?? '---'} />
            <TableRow label={t('alunoData.medicMumps')} value={medica.caxumba ?? '---'} last />
          </View>
        </ScrollView>
        <View style={styles.singleAction}>
          <Button
            label={t('alunoData.editFile')}
            variant="secondary"
            onPress={() => { setEditMedica({ ...medica }); setViewState('medica-edit'); }}
            leftIcon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={colors.brand[600]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            }
          />
        </View>
        </View>
      </View>
    );
  }

  // ── Editar ficha médica ──
  return (
    <View style={styles.containerDetail}>
      <View style={styles.editHeader}>
        <Text style={styles.editHeaderTitle}>{t('alunoData.medical')}</Text>
      </View>
      <View style={styles.detailBody}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <FormField
            label={t('alunoData.height')}
            value={editMedica.altura}
            onChangeText={(v) => setEditMedica({ ...editMedica, altura: v })}
          />
          <FormField
            label={t('alunoData.weight')}
            value={editMedica.peso}
            onChangeText={(v) => setEditMedica({ ...editMedica, peso: v })}
          />
          <SelectField
            label={t('alunoData.blood')}
            value={editMedica.tipoSanguineo}
            options={TIPOS_SANGUINEOS}
            onSelect={(v) => setEditMedica({ ...editMedica, tipoSanguineo: v })}
          />
          <FormField
            label={t('alunoData.sus')}
            value={editMedica.carteiraSUS}
            onChangeText={(v) => setEditMedica({ ...editMedica, carteiraSUS: v })}
          />
          <FormField
            label={t('alunoData.emergencyContact')}
            value={editMedica.contatoEmergencia}
            onChangeText={(v) => setEditMedica({ ...editMedica, contatoEmergencia: v })}
            placeholder="(00) 00000-0000"
          />
          <FormField
            label={t('alunoData.emergencyContact')}
            value={editMedica.nomeContatoEmergencia}
            onChangeText={(v) => setEditMedica({ ...editMedica, nomeContatoEmergencia: v })}
            placeholder="(00) 00000-0000"
          />
          <FormField
            label={t('alunoData.hospital')}
            value={editMedica.hospitalEmergencia}
            onChangeText={(v) => setEditMedica({ ...editMedica, hospitalEmergencia: v })}
            placeholder="(00) 00000-0000"
          />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t('alunoData.neurodivergent')}</Text>
            <Switch
              value={editMedica.neurodivergente}
              onValueChange={(v) => setEditMedica({ ...editMedica, neurodivergente: v })}
              trackColor={{ false: colors.gray[200], true: colors.brand[500] }}
              thumbColor={colors.base.white}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t('alunoData.pcd')}</Text>
            <Switch
              value={editMedica.pcd}
              onValueChange={(v) => setEditMedica({ ...editMedica, pcd: v })}
              trackColor={{ false: colors.gray[200], true: colors.brand[500] }}
              thumbColor={colors.base.white}
            />
          </View>
        </View>
      </ScrollView>
      <BottomActions
        onCancel={() => setViewState('medica')}
        onSave={() => { setMedica({ ...editMedica }); setViewState('medica'); }}
        cancelLabel={t('common.cancel')}
        saveLabel={t('common.save')}
      />
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden',
  },
  containerDetail: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden',
  },
  detailBody: {
    flex: 1,
    backgroundColor: colors.base.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  whiteCard: {
    flex: 1,
    backgroundColor: colors.base.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },

  // Sub-header
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.gray[100],
  },
  subHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Edit header (centered title only)
  editHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.gray[100],
  },
  editHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
  },

  // Profile info
  profileInfo: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: colors.base.white,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileAvatarBorder: {
    borderRadius: 16,
    padding: 3,
    flexShrink: 0,
  },
  profileAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 13,
  },
  profileTextGroup: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badgeBlue: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.blue[200],
    backgroundColor: colors.blueLight[50],
  },
  badgeBlueText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.blue[700],
  },
  badgeViolet: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.violet[200],
    backgroundColor: colors.violet[50],
  },
  badgeVioletText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.violet[700],
  },
  badgeOrange: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.orange[200],
    backgroundColor: colors.orange[50],
  },
  badgeOrangeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.orange[700],
  },

  // Menu list
  menuList: {
    margin: 16,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.base.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[800],
  },
  alertBiometria: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 4,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.warning[50],
    borderWidth: 1,
    borderColor: colors.warning[300],
  },
  alertBiometriaText: {
    flex: 1,
    fontSize: 13,
    color: colors.warning[800],
    lineHeight: 20,
  },
  alertBiometriaLink: {
    fontWeight: '700',
    color: colors.warning[700],
  },
  badgeOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success[50],
    borderWidth: 1,
    borderColor: colors.success[200],
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeOkText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success[700],
  },
  badgePending: {
    backgroundColor: colors.warning[50],
    borderWidth: 1,
    borderColor: colors.warning[300],
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgePendingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.warning[700],
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.gray[300],
    marginHorizontal: 0,
  },

  // Scroll content
  scrollContent: {
    padding: 16,
    gap: 12,
  },

  // Table
  table: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tableLabel: {
    fontSize: 16,
    color: colors.gray[500],
    flex: 1,
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[800],
    textAlign: 'right',
    flex: 1,
  },

  // Single action bar
  singleAction: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: colors.base.white,
  },
  editOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.brand[300],
  },
  editOutlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand[600],
  },

  // Form card
  formCard: {
    backgroundColor: colors.base.white,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[700],
  },
  fieldRequired: {
    color: colors.brand[600],
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.gray[900],
    backgroundColor: colors.base.white,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.base.white,
  },
  selectText: {
    fontSize: 14,
    color: colors.gray[900],
  },
  selectPlaceholder: {
    color: colors.gray[400],
  },
  selectOptions: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 2,
  },
  selectOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  selectOptionText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  selectOptionActive: {
    color: colors.brand[700],
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 14,
    color: colors.gray[800],
    flex: 1,
  },

  // Bottom actions (edit screens)
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: colors.base.white,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.error[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error[600],
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.brand[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.base.white,
  },

  // ── Biometria idle ───────────────────────────────────────
  biometriaIdleScroll: {
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 8,
    gap: 12,
  },
  biometriaFaceVizContainer: {
    alignSelf: 'stretch',
    marginBottom: 4,
  },
  biometriaFaceImage: {
    width: '100%',
    aspectRatio: 1,
  },
  biometriaScanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  biometriaIdleTextGroup: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
    alignItems: 'center',
  },
  biometriaIdleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    textAlign: 'center',
  },
  biometriaIdleSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
    marginTop: -4,
  },
  biometriaRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  biometriaRemoveBtnText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  biometriaInfoCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.blue[50],
    borderWidth: 1,
    borderColor: colors.blue[200],
    alignItems: 'flex-start',
    width: '100%',
  },
  biometriaInfoText: {
    flex: 1,
    fontSize: 13,
    color: colors.blue[700],
    lineHeight: 20,
  },
  biometriaScanContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 16,
  },
  faceGuideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  faceGuideArrowSlot: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometriaScanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
  },
  biometriaScanInstruction: {
    fontSize: 13,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  // Step indicator
  stepRow: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 16,
  },
  stepItemWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepLineHalf: {
    position: 'absolute',
    top: 13,
    height: 2,
    width: '50%',
    backgroundColor: colors.gray[200],
  },
  stepLineLeft: {
    left: 0,
  },
  stepLineRight: {
    right: 0,
  },
  stepLineDone: {
    backgroundColor: colors.success[400],
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.gray[300],
    backgroundColor: colors.base.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    borderColor: colors.brand[600],
    backgroundColor: colors.brand[600],
  },
  stepCircleDone: {
    borderColor: colors.success[400],
    backgroundColor: colors.success[400],
  },
  stepCircleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[400],
  },
  stepCircleTextActive: {
    color: colors.base.white,
  },
  stepLabel: {
    fontSize: 11,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: 6,
  },
  stepLabelActive: {
    color: colors.brand[600],
    fontWeight: '600',
  },
  cameraFrame: {
    width: 240,
    height: 300,
    borderRadius: 1000,
    backgroundColor: colors.gray[800],
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.brand[400],
    opacity: 0.85,
  },
  stepSuccessOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.base.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    zIndex: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  stepSuccessIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.success[50],
    borderWidth: 1,
    borderColor: colors.success[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepSuccessTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    textAlign: 'center',
  },
  stepSuccessSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  countdownCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 2.5,
    borderColor: colors.brand[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.base.white,
  },
  captureStatusRow: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  captureStatusText: {
    fontSize: 13,
    color: colors.gray[500],
  },
  captureStatusBold: {
    fontWeight: '700',
    color: colors.brand[600],
  },
  biometriaFixedBottom: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: colors.base.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  biometriaSuccessContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  biometriaSuccessIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.success[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.success[200],
  },
  biometriaSuccessTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    textAlign: 'center',
  },
  biometriaSuccessSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  biometriaCodeCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: 6,
  },
  biometriaCodeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[400],
  },
  biometriaCodeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
    letterSpacing: 0.5,
    lineHeight: 18,
  },
});
