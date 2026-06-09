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

// ─── Animated SVG components (module-level) ───────────────

const AnimatedSvgRect = Animated.createAnimatedComponent(SvgRect);
const AnimatedSvgG    = Animated.createAnimatedComponent(G);

// ─── Binary face helpers ──────────────────────────────────

const BINARY_SEED = '01101001011010010110010101100101011000010110110001110101011011100110111101101001011000010110111001101111011001010110100101100001011011100110111101100101';

function getBinaryRow(index: number): string {
  const offset = (index * 17) % BINARY_SEED.length;
  let row = '';
  for (let i = 0; i < 90; i++) row += BINARY_SEED[(offset + i) % BINARY_SEED.length] + ' ';
  return row;
}

// ─── Types ────────────────────────────────────────────────

type ViewState = 'home' | 'basicas' | 'basicas-edit' | 'medica' | 'medica-edit' | 'biometria';
type BiometriaPhase = 'idle' | 'scanning' | 'success';

interface InfoBasicas { nome: string; cpf: string; dataNascimento: string; genero: string; matricula: string; dataMatricula: string; }
interface FichaMedica {
  altura: string; peso: string; tipoSanguineo: string; carteiraSUS: string;
  contatoEmergencia: string; nomeContatoEmergencia: string; hospitalEmergencia: string;
  neurodivergente: boolean; pcd: boolean;
  alergicaMedicamento: string | null; alergicaAlimento: string | null;
  doencaCongenita: string | null; fumante: string | null; caxumba: string | null;
}

const TIPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDER_KEYS = ['alunoData.genderMale', 'alunoData.genderFemale', 'alunoData.genderNonBinary', 'alunoData.genderNoInfo'];


const STUDENT_PHOTOS: Record<string, number> = {
  TK: require('@/assets/images/avatar-thomas.jpg'),
  JK: require('@/assets/images/avatar-julia.jpg'),
};

// ─── Sub-components ───────────────────────────────────────

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={st.subHeader}>
      <TouchableOpacity onPress={onBack} style={st.backBtn}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
      <Text style={st.subHeaderTitle}>{title}</Text>
      <View style={{ width: 32 }} />
    </View>
  );
}

function TableRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[st.tableRow, !last && st.tableRowBorder]}>
      <Text style={st.tableLabel}>{label}</Text>
      <Text style={st.tableValue}>{value || '---'}</Text>
    </View>
  );
}

function FormField({ label, value, onChangeText, placeholder, required }: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  const t = useT();
  return (
    <View style={st.fieldGroup}>
      <Text style={st.fieldLabel}>{label}{required && <Text style={st.fieldRequired}> *</Text>}</Text>
      <TextInput
        style={st.fieldInput} value={value} onChangeText={onChangeText}
        placeholder={placeholder ?? t('common.writeHere')} placeholderTextColor={colors.gray[400]}
      />
    </View>
  );
}

function SelectField({ label, value, options, onSelect }: {
  label: string; value: string; options: string[]; onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <View style={st.fieldGroup}>
      <Text style={st.fieldLabel}>{label}<Text style={st.fieldRequired}> *</Text></Text>
      <TouchableOpacity style={st.selectBox} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Text style={[st.selectText, !value && st.selectPlaceholder]}>{value || t('common.select')}</Text>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M6 9l6 6 6-6" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
      {open && (
        <View style={st.selectOptions}>
          {options.map((opt) => (
            <TouchableOpacity key={opt} style={st.selectOption} onPress={() => { onSelect(opt); setOpen(false); }}>
              <Text style={[st.selectOptionText, opt === value && st.selectOptionActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function BottomActions({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  const t = useT();
  return (
    <View style={st.bottomActions}>
      <Button label={t('common.cancel')} variant="secondary-gray" onPress={onCancel} style={{ flex: 1 }} />
      <Button label={t('common.save')} onPress={onSave} style={{ flex: 1 }}
        leftIcon={<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path d="M17 21v-8H7v8M7 3v5h8M5 3h11l3 3v13a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke={colors.base.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>}
      />
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────

export default function AlunoDadosScreen() {
  const t        = useT();
  const router   = useRouter();
  const params   = useLocalSearchParams<{ id: string; nome: string; iniciais: string; turma: string; matricula: string }>();
  const { width: windowWidth } = useWindowDimensions();
  const { setHideHeader } = useApp();

  const generos = GENDER_KEYS.map(k => t(k));

  const CAPTURE_STEPS = [
    { label: t('alunoData.front'),     instructionKey: 'alunoData.bioInstructFront' },
    { label: t('alunoData.leftSide'),  instructionKey: 'alunoData.bioInstructLeft' },
    { label: t('alunoData.rightSide'), instructionKey: 'alunoData.bioInstructRight' },
  ];

  useEffect(() => { setHideHeader(true);  }, []);
  useEffect(() => () => { setHideHeader(false); }, []);

  const studentId = params.id ?? '0';

  const [viewState, setViewState]         = useState<ViewState>('home');
  const [biometriaPhase, setBiometriaPhase] = useState<BiometriaPhase>('idle');
  const [captureStep, setCaptureStep]     = useState(0);
  const [isCapturing, setIsCapturing]     = useState(false);
  const [countdown, setCountdown]         = useState<number | null>(null);
  const [showStepSuccess, setShowStepSuccess] = useState(false);
  const [faceCode, setFaceCode]           = useState<string | null>(null);

  const [basicas, setBasicas] = useState<InfoBasicas>({
    nome: params.nome ?? 'Aluno',
    cpf: '---',
    dataNascimento: '01/01/2018',
    genero: 'Masculino',
    matricula: params.matricula ?? '---',
    dataMatricula: '02/02/2025',
  });
  const [editBasicas, setEditBasicas] = useState<InfoBasicas>({ ...basicas });

  const [medica, setMedica] = useState<FichaMedica>({
    altura: '1,30', peso: '32', tipoSanguineo: 'A+', carteiraSUS: '123456789',
    contatoEmergencia: '(42) 98765-4321', nomeContatoEmergencia: '',
    hospitalEmergencia: 'Hospital da Criança', neurodivergente: false, pcd: false,
    alergicaMedicamento: null, alergicaAlimento: null, doencaCongenita: null, fumante: null, caxumba: null,
  });
  const [editMedica, setEditMedica] = useState<FichaMedica>({ ...medica });

  // Biometria animation
  const faceScanAnim    = useRef(new Animated.Value(0)).current;
  const faceScanOpacity = useRef(new Animated.Value(0)).current;
  const scannerY        = faceScanAnim.interpolate({ inputRange: [0, 1], outputRange: [-28, windowWidth + 28] });

  const scanAnim        = useRef(new Animated.Value(0)).current;
  const guideAnim       = useRef(new Animated.Value(0)).current;
  const captureFlashAnim = useRef(new Animated.Value(0)).current;
  const handleCaptureRef = useRef<() => Promise<void>>(async () => {});
  const cameraRef        = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const activePhoto = STUDENT_PHOTOS[params.iniciais ?? ''] ?? require('@/assets/images/avatar.jpg');

  // Load biometric on mount
  useEffect(() => {
    getBiometric(studentId).then((entry) => setFaceCode(entry?.code ?? null));
  }, [studentId]);

  // Idle face scanner loop
  useEffect(() => {
    if (biometriaPhase !== 'idle') {
      faceScanAnim.stopAnimation(); faceScanOpacity.stopAnimation();
      faceScanAnim.setValue(0); faceScanOpacity.setValue(0);
      return;
    }
    faceScanAnim.setValue(0); faceScanOpacity.setValue(0);
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(faceScanAnim,    { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: false }),
      Animated.timing(faceScanOpacity, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.timing(faceScanOpacity, { toValue: 1, duration: 1200, useNativeDriver: false }),
      Animated.timing(faceScanOpacity, { toValue: 0, duration: 400, useNativeDriver: false }),
      Animated.timing(faceScanAnim,    { toValue: 0, duration: 300, useNativeDriver: false }),
    ]));
    anim.start();
    return () => anim.stop();
  }, [biometriaPhase]);

  // Camera scanning animation
  useEffect(() => {
    if (biometriaPhase !== 'scanning') {
      scanAnim.stopAnimation(); scanAnim.setValue(0);
      guideAnim.stopAnimation(); guideAnim.setValue(0);
      setCaptureStep(0); return;
    }
    scanAnim.setValue(0);
    Animated.loop(Animated.timing(scanAnim, { toValue: 1, duration: 2200, useNativeDriver: true })).start();
  }, [biometriaPhase]);

  useEffect(() => {
    if (biometriaPhase !== 'scanning') return;
    guideAnim.stopAnimation(); guideAnim.setValue(0);
    Animated.loop(Animated.sequence([
      Animated.timing(guideAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
      Animated.delay(250),
      Animated.timing(guideAnim, { toValue: 0, duration: 750, useNativeDriver: true }),
      Animated.delay(400),
    ])).start();
  }, [captureStep, biometriaPhase]);

  // Countdown
  useEffect(() => {
    if (biometriaPhase !== 'scanning' || !permission?.granted || isCapturing) { setCountdown(null); return; }
    setCountdown(3);
    const t1 = setTimeout(() => setCountdown(2), 1000);
    const t2 = setTimeout(() => setCountdown(1), 2000);
    const t3 = setTimeout(() => { setCountdown(null); handleCaptureRef.current(); }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [captureStep, biometriaPhase, permission?.granted, isCapturing]);

  // Capture logic
  handleCaptureRef.current = async () => {
    if (biometriaPhase !== 'scanning' || !permission?.granted || isCapturing) return;
    setIsCapturing(true);
    Animated.sequence([
      Animated.timing(captureFlashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(captureFlashAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start();
    await new Promise((r) => setTimeout(r, 400));
    if (captureStep < CAPTURE_STEPS.length - 1) {
      setShowStepSuccess(true);
      setTimeout(() => { setShowStepSuccess(false); setCaptureStep((s) => s + 1); setIsCapturing(false); }, 1200);
    } else {
      const code = `${studentId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      await saveBiometric({ studentId, studentName: basicas.nome, code, enrolledAt: new Date().toISOString() });
      setFaceCode(code);
      setBiometriaPhase('success');
      setIsCapturing(false);
    }
  };

  const handleRemoveBiometric = async () => {
    await removeBiometric(studentId);
    setFaceCode(null);
  };

  // ── Home ──────────────────────────────────────────────────
  if (viewState === 'home') {
    return (
      <View style={st.containerDetail}>
        <SubHeader title={t('alunoData.title')} onBack={() => router.back()} />
        <View style={st.detailBody}>
        <View style={st.whiteCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={st.profileInfo}>
            <View style={st.profileRow}>
              <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.profileAvatarBorder}>
                <Image source={activePhoto} style={st.profileAvatarImage} />
              </LinearGradient>
              <View style={st.profileTextGroup}>
                <Text style={st.profileName}>{basicas.nome}</Text>
                <View style={st.badgesRow}>
                  <View style={st.badgeBlue}><Text style={st.badgeBlueText}>{params.turma}</Text></View>
                  {medica.neurodivergente && <View style={st.badgeViolet}><Text style={st.badgeVioletText}>{t('alunoData.neurodivergent')}</Text></View>}
                  {medica.pcd && <View style={st.badgeOrange}><Text style={st.badgeOrangeText}>{t('alunoData.pcd').split(' ')[0]}</Text></View>}
                </View>
              </View>
            </View>
          </View>

          {!faceCode && (
            <View style={st.alertBiometria}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <Path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={colors.warning[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={st.alertBiometriaText}>
                {t('alunoData.bioAlertText').split('Biometria facial').map((part, i, arr) =>
                  i < arr.length - 1
                    ? [part, <Text key={i} style={st.alertBiometriaLink} onPress={() => setViewState('biometria')}>{t('alunoData.biometrics')}</Text>]
                    : part
                )}
              </Text>
            </View>
          )}

          <View style={st.menuList}>
            {([
              { key: 'basicas',   label: t('alunoData.basicInfo'),   badge: null },
              { key: 'medica',    label: t('alunoData.medical'),     badge: null },
              { key: 'biometria', label: t('alunoData.biometrics'),  badge: faceCode ? 'ok' : 'pending' },
            ] as const).map((item, idx, arr) => (
              <View key={item.key}>
                <TouchableOpacity style={st.menuItem} onPress={() => setViewState(item.key as ViewState)} activeOpacity={0.8}>
                  <View style={st.menuItemLeft}>
                    <Text style={st.menuItemText}>{item.label}</Text>
                    {item.badge === 'ok' && (
                      <View style={st.badgeOk}>
                        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                          <Path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke={colors.success[600]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                        <Text style={st.badgeOkText}>{t('common.registered')}</Text>
                      </View>
                    )}
                    {item.badge === 'pending' && (
                      <View style={st.badgePending}><Text style={st.badgePendingText}>{t('common.pending')}</Text></View>
                    )}
                  </View>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M9 18l6-6-6-6" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
                {idx < arr.length - 1 && <View style={st.menuDivider} />}
              </View>
            ))}
          </View>
        </ScrollView>
        </View>
        </View>
      </View>
    );
  }

  // ── Informações básicas ───────────────────────────────────
  if (viewState === 'basicas') {
    return (
      <View style={st.containerDetail}>
        <SubHeader title={t('alunoData.basicInfo')} onBack={() => setViewState('home')} />
        <View style={st.detailBody}>
        <View style={st.whiteCard}>
        <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={st.table}>
            <TableRow label={t('alunoData.name')}           value={basicas.nome} />
            <TableRow label={t('alunoData.cpf')}            value={basicas.cpf} />
            <TableRow label={t('alunoData.birthDate')}      value={basicas.dataNascimento} />
            <TableRow label={t('alunoData.gender')}         value={basicas.genero} />
            <TableRow label={t('alunoData.enrollment')}     value={basicas.matricula} />
            <TableRow label={t('alunoData.enrollmentDate')} value={basicas.dataMatricula} last />
          </View>
        </ScrollView>
        <View style={st.singleAction}>
          <Button label={t('alunoData.editInfo')} variant="secondary" onPress={() => { setEditBasicas({ ...basicas }); setViewState('basicas-edit'); }}
            leftIcon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={colors.brand[600]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>}
          />
        </View>
        </View>
        </View>
      </View>
    );
  }

  // ── Editar informações básicas ────────────────────────────
  if (viewState === 'basicas-edit') {
    return (
      <View style={st.containerDetail}>
        <View style={st.editHeader}><Text style={st.editHeaderTitle}>{t('alunoData.editBasicsTitle')}</Text></View>
        <View style={st.detailBody}>
        <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={st.formCard}>
            <FormField label={t('alunoData.name')}      value={editBasicas.nome}           onChangeText={(v) => setEditBasicas({ ...editBasicas, nome: v })} required />
            <FormField label={t('alunoData.cpf')}       value={editBasicas.cpf}            onChangeText={(v) => setEditBasicas({ ...editBasicas, cpf: v })} required />
            <FormField label={t('alunoData.birthDate')} value={editBasicas.dataNascimento} onChangeText={(v) => setEditBasicas({ ...editBasicas, dataNascimento: v })} required />
            <SelectField label={t('alunoData.gender')} value={editBasicas.genero} options={generos} onSelect={(v) => setEditBasicas({ ...editBasicas, genero: v })} />
          </View>
        </ScrollView>
        <BottomActions onCancel={() => setViewState('basicas')} onSave={() => { setBasicas({ ...editBasicas }); setViewState('basicas'); }} />
        </View>
      </View>
    );
  }

  // ── Ficha médica ──────────────────────────────────────────
  if (viewState === 'medica') {
    const BoolRow = ({ label, value }: { label: string; value: boolean }) => (
      <View style={[st.tableRow, st.tableRowBorder]}>
        <Text style={st.tableLabel}>{label}</Text>
        <View style={[st.boolBadge, { backgroundColor: value ? colors.success[50] : colors.gray[100] }]}>
          <Text style={[st.boolText, { color: value ? colors.success[700] : colors.gray[500] }]}>{value ? t('common.yes') : t('common.no')}</Text>
        </View>
      </View>
    );
    return (
      <View style={st.containerDetail}>
        <SubHeader title={t('alunoData.medical')} onBack={() => setViewState('home')} />
        <View style={st.detailBody}>
        <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={st.table}>
            <TableRow label={t('alunoData.height')}           value={medica.altura} />
            <TableRow label={t('alunoData.weight')}           value={medica.peso} />
            <TableRow label={t('alunoData.blood')}            value={medica.tipoSanguineo} />
            <TableRow label={t('alunoData.sus')}              value={medica.carteiraSUS} />
            <TableRow label={t('alunoData.emergencyContact')} value={medica.contatoEmergencia} />
            <TableRow label={t('alunoData.hospital')}         value={medica.hospitalEmergencia} />
            <BoolRow label={t('alunoData.neurodivergent')} value={medica.neurodivergente} />
            <BoolRow label={t('alunoData.pcd')}            value={medica.pcd} />
            <TableRow label={t('alunoData.medicAllergyMedShort')} value={medica.alergicaMedicamento ?? t('common.no')} />
            <TableRow label={t('alunoData.medicAllergyFoodShort')} value={medica.alergicaAlimento ?? t('common.no')} />
            <TableRow label={t('alunoData.medicCongenitalShort')} value={medica.doencaCongenita ?? t('common.no')} last />
          </View>
        </ScrollView>
        <View style={st.singleAction}>
          <Button label={t('alunoData.editFile')} variant="secondary" onPress={() => { setEditMedica({ ...medica }); setViewState('medica-edit'); }}
            leftIcon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={colors.brand[600]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>}
          />
        </View>
        </View>
      </View>
    );
  }

  // ── Editar ficha médica ───────────────────────────────────
  if (viewState === 'medica-edit') {
    return (
      <View style={st.containerDetail}>
        <View style={st.editHeader}><Text style={st.editHeaderTitle}>{t('alunoData.editMedicalTitle')}</Text></View>
        <View style={st.detailBody}>
        <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={st.formCard}>
            <FormField label={t('alunoData.height')} value={editMedica.altura} onChangeText={(v) => setEditMedica({ ...editMedica, altura: v })} />
            <FormField label={t('alunoData.weight')} value={editMedica.peso}   onChangeText={(v) => setEditMedica({ ...editMedica, peso: v })} />
            <SelectField label={t('alunoData.blood')} value={editMedica.tipoSanguineo} options={TIPOS_SANGUINEOS} onSelect={(v) => setEditMedica({ ...editMedica, tipoSanguineo: v })} />
            <FormField label={t('alunoData.sus')}             value={editMedica.carteiraSUS}        onChangeText={(v) => setEditMedica({ ...editMedica, carteiraSUS: v })} />
            <FormField label={t('alunoData.emergencyContact')} value={editMedica.contatoEmergencia} onChangeText={(v) => setEditMedica({ ...editMedica, contatoEmergencia: v })} />
            <FormField label={t('alunoData.hospital')}         value={editMedica.hospitalEmergencia} onChangeText={(v) => setEditMedica({ ...editMedica, hospitalEmergencia: v })} />
            <View style={st.switchRow}>
              <Text style={st.switchLabel}>{t('alunoData.neurodivergent')}</Text>
              <Switch value={editMedica.neurodivergente} onValueChange={(v) => setEditMedica({ ...editMedica, neurodivergente: v })} trackColor={{ true: colors.brand[500] }} />
            </View>
            <View style={st.switchRow}>
              <Text style={st.switchLabel}>{t('alunoData.pcd')}</Text>
              <Switch value={editMedica.pcd} onValueChange={(v) => setEditMedica({ ...editMedica, pcd: v })} trackColor={{ true: colors.brand[500] }} />
            </View>
          </View>
        </ScrollView>
        <BottomActions onCancel={() => setViewState('medica')} onSave={() => { setMedica({ ...editMedica }); setViewState('medica'); }} />
        </View>
      </View>
    );
  }

  // ── Biometria Facial ──────────────────────────────────────
  if (viewState === 'biometria') {
    return (
      <View style={st.containerDetail}>
        <SubHeader title={t('alunoData.biometrics')} onBack={() => { setBiometriaPhase('idle'); setViewState('home'); }} />
        <View style={st.detailBody}>
        <View style={st.whiteCard}>

          {/* Idle */}
          {biometriaPhase === 'idle' && (
            <>
              <ScrollView contentContainerStyle={st.biometriaIdleScroll} showsVerticalScrollIndicator={false}>
                <View style={[st.biometriaFaceVizContainer, { width: windowWidth, height: windowWidth }]}>
                  <Image source={require('@/assets/images/face-binary.png.png')} style={{ width: windowWidth, height: windowWidth }} resizeMode="cover" />
                  <Svg width={windowWidth} height={windowWidth} viewBox="0 0 240 240" style={st.biometriaScanOverlay}>
                    <Defs>
                      <SvgLinearGradient id="gScanGreen2" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#00E554" stopOpacity="0" />
                        <Stop offset="0.3" stopColor="#00E554" stopOpacity="0.22" />
                        <Stop offset="0.5" stopColor="#00E554" stopOpacity="0.9" />
                        <Stop offset="0.7" stopColor="#00E554" stopOpacity="0.22" />
                        <Stop offset="1" stopColor="#00E554" stopOpacity="0" />
                      </SvgLinearGradient>
                      <SvgLinearGradient id="gScanRed2" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#F97066" stopOpacity="0" />
                        <Stop offset="0.3" stopColor="#F97066" stopOpacity="0.22" />
                        <Stop offset="0.5" stopColor="#F97066" stopOpacity="0.9" />
                        <Stop offset="0.7" stopColor="#F97066" stopOpacity="0.22" />
                        <Stop offset="1" stopColor="#F97066" stopOpacity="0" />
                      </SvgLinearGradient>
                    </Defs>
                    <AnimatedSvgRect x="0" y={scannerY} width="240" height="52" fill={faceCode ? 'url(#gScanGreen2)' : 'url(#gScanRed2)'} />
                    <AnimatedSvgG opacity={faceScanOpacity}>
                      <Circle cx="120" cy="120" r="58" fill={faceCode ? '#00E554' : colors.error[400]} opacity={0.06} />
                      <Circle cx="120" cy="120" r="46" fill={faceCode ? '#00E554' : colors.error[400]} opacity={0.09} />
                      <G transform="translate(120, 120) scale(0.73) translate(-59, -56)">
                        <SvgRect x="11.5" y="10" width="95" height="92" rx="46" fill={faceCode ? '#5CAC75' : colors.error[400]} fillOpacity={faceCode ? 0.28 : 0.18} />
                        <SvgRect x="11.5" y="10" width="95" height="92" rx="46" fill="#FFFFFF" fillOpacity={faceCode ? 0.12 : 0.1} />
                        <Path d="M 30 22 Q 59 14 88 22" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        <SvgRect x="12" y="10.5" width="94" height="91" rx="45.5" stroke="rgba(255,255,255,0.32)" strokeWidth="1" fill="none" />
                        <Path d="M 30 88 Q 59 97 88 88" stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none" strokeLinecap="round" />
                        {faceCode ? (
                          <Path d="M54.6929 56.1366L57.5717 59.0154L64.049 52.5381M54.9836 68.5167C55.4553 68.4543 55.9319 68.5822 56.3077 68.8717L58.0396 70.2007C58.6121 70.6405 59.4085 70.6405 59.9794 70.2007L61.7769 68.8205C62.1128 68.563 62.5365 68.4495 62.9555 68.5055L65.204 68.8013C65.9188 68.8957 66.6081 68.4975 66.8848 67.8306L67.7499 65.7387C67.9114 65.3469 68.2217 65.0366 68.6135 64.8751L70.7052 64.0099C71.3721 63.7348 71.7703 63.0439 71.6759 62.329L71.3913 60.162C71.3289 59.6902 71.4568 59.2136 71.7463 58.8378L73.0752 57.1058C73.515 56.5332 73.515 55.7368 73.0752 55.1658L71.6951 53.3683C71.4377 53.0324 71.3241 52.6086 71.3801 52.1896L71.6759 49.941C71.7703 49.2261 71.3721 48.5368 70.7052 48.2602L68.6135 47.3949C68.2217 47.2334 67.9114 46.9232 67.7499 46.5313L66.8848 44.4395C66.6097 43.7726 65.9188 43.3743 65.204 43.4687L62.9555 43.7646C62.5365 43.8221 62.1128 43.7086 61.7785 43.4527L59.981 42.0725C59.4085 41.6327 58.6121 41.6327 58.0412 42.0725L56.2437 43.4527C55.9079 43.7086 55.4841 43.8221 55.0651 43.7678L52.8167 43.4719C52.1018 43.3775 51.4126 43.7758 51.1359 44.4427L50.2723 46.5345C50.1092 46.9247 49.799 47.235 49.4088 47.3981L47.317 48.2618C46.6502 48.5384 46.252 49.2277 46.3463 49.9426L46.6422 52.1912C46.6965 52.6102 46.583 53.034 46.3271 53.3683L44.947 55.1658C44.5072 55.7384 44.5072 56.5348 44.947 57.1058L46.3271 58.9034C46.5846 59.2392 46.6981 59.663 46.6422 60.082L46.3463 62.3306C46.252 63.0455 46.6502 63.7348 47.317 64.0115L49.4088 64.8767C49.8006 65.0382 50.1108 65.3485 50.2723 65.7403L51.1375 67.8322C51.4126 68.4991 52.1034 68.8973 52.8183 68.8029L54.9836 68.5167Z"
                            stroke="#008B00" strokeWidth="2.87879" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        ) : (
                          <Path d="M 50 47 L 68 65 M 68 47 L 50 65" stroke={colors.error[500]} strokeWidth="3.5" strokeLinecap="round" fill="none" />
                        )}
                      </G>
                    </AnimatedSvgG>
                  </Svg>
                </View>

                <View style={st.biometriaIdleTextGroup}>
                  <Text style={st.biometriaIdleTitle}>{faceCode ? t('alunoData.bioRegistered') : t('alunoData.bioNone')}</Text>
                  <Text style={st.biometriaIdleSubtitle}>{faceCode ? `ID: ${faceCode.slice(0, 16)}...` : t('alunoData.bioScanPrompt')}</Text>
                  <View style={st.biometriaInfoCard}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M12 22C17.523 22 22 17.523 22 12S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM11 12h1v4h1M12 8h.01" stroke={colors.blue[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={st.biometriaInfoText}>{t('alunoData.bioInfo')}</Text>
                  </View>
                </View>
              </ScrollView>

              <View style={st.biometriaFixedBottom}>
                <Button variant={faceCode ? 'secondary' : 'primary'} label={faceCode ? t('alunoData.bioReRegister') : t('alunoData.bioRegister')}
                  onPress={() => setBiometriaPhase('scanning')} fullWidth
                  leftIcon={<Svg width={18} height={18} viewBox="0 0 40 40" fill="none">
                    {(['M5 13 L5 6 L12 6','M28 6 L35 6 L35 13','M5 27 L5 34 L12 34','M28 34 L35 34 L35 27'] as const).map((d, i) => (
                      <Path key={i} d={d} stroke={faceCode ? colors.brand[700] : colors.base.white} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    ))}
                    <Circle cx="15" cy="18" r="2.5" fill={faceCode ? colors.brand[700] : colors.base.white} />
                    <Circle cx="25" cy="18" r="2.5" fill={faceCode ? colors.brand[700] : colors.base.white} />
                    <Path d="M13 26 Q20 31 27 26" stroke={faceCode ? colors.brand[700] : colors.base.white} strokeWidth="2" fill="none" strokeLinecap="round" />
                  </Svg>}
                />
                {faceCode && (
                  <TouchableOpacity style={st.biometriaRemoveBtn} onPress={handleRemoveBiometric} activeOpacity={0.7}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={colors.gray[500]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={st.biometriaRemoveBtnText}>{t('alunoData.bioRemove')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Scanning */}
          {biometriaPhase === 'scanning' && (
            <>
              <View style={st.biometriaScanContainer}>
                <Text style={st.biometriaScanTitle}>{t('alunoData.bioStart')}</Text>
                {permission?.granted && (
                  <View style={st.stepRow}>
                    {CAPTURE_STEPS.map((step, idx) => (
                      <View key={idx} style={st.stepItemWrapper}>
                        {idx > 0 && <View style={[st.stepLineHalf, st.stepLineLeft, captureStep >= idx && st.stepLineDone]} />}
                        {idx < CAPTURE_STEPS.length - 1 && <View style={[st.stepLineHalf, st.stepLineRight, captureStep > idx && st.stepLineDone]} />}
                        <View style={[st.stepCircle, idx < captureStep && st.stepCircleDone, idx === captureStep && st.stepCircleActive]}>
                          {idx < captureStep ? (
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                              <Path d="M5 13l4 4L19 7" stroke={colors.base.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                          ) : (
                            <Text style={[st.stepCircleText, idx === captureStep && st.stepCircleTextActive]}>{idx + 1}</Text>
                          )}
                        </View>
                        <Text style={[st.stepLabel, idx === captureStep && st.stepLabelActive]}>{step.label}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={st.biometriaScanInstruction}>
                  {!permission?.granted ? t('alunoData.cameraPermission') : t(CAPTURE_STEPS[captureStep].instructionKey)}
                </Text>
                {permission?.granted && (
                  <View style={st.cameraWrapper}>
                    <CameraView ref={cameraRef} style={st.camera} facing="front">
                      <Animated.View style={[st.scanLine, {
                        transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 220] }) }],
                      }]} />
                      <Animated.View style={[st.captureFlash, { opacity: captureFlashAnim }]} />
                    </CameraView>
                    {countdown !== null && countdown > 0 && (
                      <View style={st.countdownOverlay}>
                        <View style={st.countdownCircle}><Text style={st.countdownNumber}>{countdown}</Text></View>
                      </View>
                    )}
                  </View>
                )}
              </View>
              <View style={st.biometriaFixedBottom}>
                {!permission?.granted && <Button label={t('alunoData.allowCamera')} onPress={requestPermission} />}
                {permission?.granted && isCapturing && <View style={st.captureStatusRow}><Text style={st.captureStatusText}>{t('alunoData.processing')}</Text></View>}
                <Button label={t('alunoData.bioCancel')} variant="secondary-gray" onPress={() => setBiometriaPhase('idle')} />
              </View>
            </>
          )}

          {/* Step success overlay */}
          {showStepSuccess && (
            <View style={st.stepSuccessOverlay}>
              <View style={st.stepSuccessIconCircle}>
                <Svg width={52} height={52} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke={colors.success[500]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={st.stepSuccessTitle}>{CAPTURE_STEPS[captureStep] ? t('alunoData.stepCaptured', { label: CAPTURE_STEPS[captureStep].label }) : ''}</Text>
              <Text style={st.stepSuccessSubtitle}>{captureStep === 0 ? t('alunoData.stepTurnLeft') : t('alunoData.stepTurnRight')}</Text>
            </View>
          )}

          {/* Success */}
          {biometriaPhase === 'success' && (
            <>
              <View style={st.biometriaSuccessContainer}>
                <View style={st.biometriaSuccessIcon}>
                  <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
                    <Path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke={colors.success[500]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={st.biometriaSuccessTitle}>{t('alunoData.bioSuccess')}</Text>
                <Text style={st.biometriaSuccessSubtitle}>{t('alunoData.bioSuccessSub')}</Text>
                <View style={st.biometriaCodeCard}>
                  <Text style={st.biometriaCodeLabel}>{t('alunoData.bioCode')}</Text>
                  <Text style={st.biometriaCodeValue} numberOfLines={2}>{faceCode}</Text>
                </View>
              </View>
              <View style={st.biometriaFixedBottom}>
                <Button label={t('alunoData.bioFinish')} onPress={() => setBiometriaPhase('idle')} />
              </View>
            </>
          )}

        </View>
        </View>
      </View>
    );
  }

  return null;
}

// ─── Styles ───────────────────────────────────────────────

const st = StyleSheet.create({
  containerDetail: { flex: 1, backgroundColor: colors.gray[100] },
  detailBody:      { flex: 1, backgroundColor: colors.base.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  whiteCard:       { flex: 1, backgroundColor: colors.base.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },

  subHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.gray[100] },
  subHeaderTitle: { fontSize: 16, fontWeight: '600', color: colors.gray[900] },
  backBtn:        { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  editHeader:     { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.gray[100] },
  editHeaderTitle:{ fontSize: 16, fontWeight: '600', color: colors.gray[900] },

  scrollContent: { padding: 16 },

  profileInfo: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },
  profileRow:  { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileAvatarBorder: { width: 64, height: 64, borderRadius: 16, padding: 2, alignItems: 'center', justifyContent: 'center' },
  profileAvatarImage:  { width: 60, height: 60, borderRadius: 14 },
  profileTextGroup: { flex: 1, gap: 6 },
  profileName:  { fontSize: 17, fontWeight: '700', color: colors.gray[900] },
  badgesRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badgeBlue:    { backgroundColor: colors.blue[100], paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeBlueText:{ fontSize: 12, fontWeight: '600', color: colors.blue[700] },
  badgeViolet:  { backgroundColor: colors.violet[100], paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeVioletText: { fontSize: 12, fontWeight: '600', color: colors.violet[700] },
  badgeOrange:  { backgroundColor: colors.orange[100], paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeOrangeText: { fontSize: 12, fontWeight: '600', color: colors.orange[700] },

  alertBiometria: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: colors.warning[50], borderWidth: 1, borderColor: colors.warning[200], alignItems: 'flex-start' },
  alertBiometriaText: { flex: 1, fontSize: 13, color: colors.warning[700], lineHeight: 20 },
  alertBiometriaLink: { fontWeight: '700', textDecorationLine: 'underline' },

  menuList: { paddingHorizontal: 16, paddingBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuItemText: { fontSize: 15, fontWeight: '500', color: colors.gray[900] },
  menuDivider:  { height: 1, backgroundColor: colors.gray[100] },
  badgeOk:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success[50], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeOkText:  { fontSize: 11, fontWeight: '600', color: colors.success[700] },
  badgePending: { backgroundColor: colors.warning[100], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgePendingText: { fontSize: 11, fontWeight: '600', color: colors.warning[700] },

  table:         { borderRadius: 16, borderWidth: 1, borderColor: colors.gray[200], overflow: 'hidden' },
  tableRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.base.white },
  tableRowBorder:{ borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  tableLabel:    { fontSize: 13, color: colors.gray[500], flex: 1 },
  tableValue:    { fontSize: 13, fontWeight: '600', color: colors.gray[900], flex: 1, textAlign: 'right' },
  boolBadge:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  boolText:      { fontSize: 12, fontWeight: '600' },

  singleAction:  { paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  bottomActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.gray[100] },

  formCard: { gap: 16 },
  fieldGroup:   { gap: 6 },
  fieldLabel:   { fontSize: 13, fontWeight: '600', color: colors.gray[700] },
  fieldRequired:{ color: colors.error[500] },
  fieldInput:   { borderWidth: 1, borderColor: colors.gray[300], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: colors.gray[900], backgroundColor: colors.base.white },
  selectBox:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.gray[300], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11 },
  selectText:   { fontSize: 14, color: colors.gray[900] },
  selectPlaceholder: { color: colors.gray[400] },
  selectOptions:{ borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, overflow: 'hidden', marginTop: 4 },
  selectOption: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  selectOptionText: { fontSize: 14, color: colors.gray[700] },
  selectOptionActive: { color: colors.brand[700], fontWeight: '600' },
  switchRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  switchLabel:  { fontSize: 14, color: colors.gray[800] },

  // Biometria idle
  biometriaIdleScroll: { alignItems: 'center', paddingBottom: 8, gap: 12 },
  biometriaFaceVizContainer: { alignSelf: 'stretch' },
  biometriaScanOverlay: { position: 'absolute', top: 0, left: 0 },
  biometriaIdleTextGroup: { width: '100%', paddingHorizontal: 20, paddingTop: 12, gap: 8, alignItems: 'center' },
  biometriaIdleTitle: { fontSize: 18, fontWeight: '700', color: colors.gray[900], textAlign: 'center' },
  biometriaIdleSubtitle: { fontSize: 14, color: colors.gray[500], textAlign: 'center', lineHeight: 22, marginTop: -4 },
  biometriaInfoCard: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 12, backgroundColor: colors.blue[50], borderWidth: 1, borderColor: colors.blue[200], alignItems: 'flex-start', width: '100%' },
  biometriaInfoText: { flex: 1, fontSize: 13, color: colors.blue[700], lineHeight: 20 },
  biometriaFixedBottom: { gap: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, backgroundColor: colors.base.white, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  biometriaRemoveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 4 },
  biometriaRemoveBtnText: { fontSize: 14, color: colors.gray[500] },

  // Biometria scanning
  biometriaScanContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, gap: 16 },
  biometriaScanTitle: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  biometriaScanInstruction: { fontSize: 14, color: colors.gray[500], textAlign: 'center', lineHeight: 22 },
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 0, width: '100%' },
  stepItemWrapper: { alignItems: 'center', gap: 6, flex: 1, position: 'relative' },
  stepLineHalf: { position: 'absolute', top: 14, height: 2, width: '50%', backgroundColor: colors.gray[200] },
  stepLineLeft:  { left: 0 },
  stepLineRight: { right: 0 },
  stepLineDone:  { backgroundColor: colors.brand[500] },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.gray[200], alignItems: 'center', justifyContent: 'center' },
  stepCircleDone: { backgroundColor: colors.brand[500] },
  stepCircleActive: { backgroundColor: colors.brand[100], borderWidth: 2, borderColor: colors.brand[500] },
  stepCircleText: { fontSize: 12, fontWeight: '600', color: colors.gray[500] },
  stepCircleTextActive: { color: colors.brand[700] },
  stepLabel: { fontSize: 11, color: colors.gray[400], textAlign: 'center' },
  stepLabelActive: { color: colors.brand[600], fontWeight: '600' },
  cameraWrapper: { width: '100%', height: 220, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  camera:        { flex: 1 },
  scanLine:      { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: colors.brand[400] },
  captureFlash:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'white' },
  countdownOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  countdownCircle:  { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  countdownNumber:  { fontSize: 36, fontWeight: '800', color: colors.base.white },
  captureStatusRow: { alignItems: 'center' },
  captureStatusText:{ fontSize: 13, color: colors.gray[500] },

  stepSuccessOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 10 },
  stepSuccessIconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.success[50], alignItems: 'center', justifyContent: 'center' },
  stepSuccessTitle:   { fontSize: 20, fontWeight: '700', color: colors.base.white, textAlign: 'center' },
  stepSuccessSubtitle:{ fontSize: 14, color: colors.gray[300], textAlign: 'center', lineHeight: 22 },

  biometriaSuccessContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
  biometriaSuccessIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.success[50], alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.success[200] },
  biometriaSuccessTitle:  { fontSize: 20, fontWeight: '700', color: colors.gray[900], textAlign: 'center' },
  biometriaSuccessSubtitle:{ fontSize: 14, color: colors.gray[500], textAlign: 'center', lineHeight: 22 },
  biometriaCodeCard:  { width: '100%', padding: 16, borderRadius: 12, backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], gap: 6 },
  biometriaCodeLabel: { fontSize: 12, fontWeight: '500', color: colors.gray[400] },
  biometriaCodeValue: { fontSize: 12, fontWeight: '600', color: colors.gray[700], letterSpacing: 0.5, lineHeight: 18 },
});
