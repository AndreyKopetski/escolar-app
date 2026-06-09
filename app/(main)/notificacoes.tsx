import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  Modal, Pressable, Animated, Image, Easing, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect as SvgRect, LinearGradient as SvgLinearGradient, Stop, G, Defs } from 'react-native-svg';
import { useApp } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

const AnimatedScanRect = Animated.createAnimatedComponent(SvgRect);
const AnimatedScanG    = Animated.createAnimatedComponent(G);

// ─── Types ────────────────────────────────────────────────

type HighlightColor = 'brand' | 'blue' | 'violet';
type Segment = { text: string; highlight?: HighlightColor };
type NotifType = 'attendance' | 'assessment' | 'schedule' | 'diary' | 'book';

type Notification = {
  id: string;
  type: NotifType;
  title: string;
  time: string;
  body: Segment[];
  read: boolean;
};

// ─── Mock data ────────────────────────────────────────────

const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  brand:  colors.brand[700],
  blue:   colors.blue[600],
  violet: colors.violet[600],
};

type TFn = (key: string) => string;

function getMockNotifications(t: TFn): Notification[] {
  return [
    {
      id: '1',
      type: 'attendance',
      title: t('notif.main.studentPresent'),
      time: t('common.now'),
      body: [
        { text: t('notif.main.presentPre') },
        { text: 'Thomas', highlight: 'brand' as const },
        { text: t('notif.main.presentMid') },
        { text: t('notif.main.presentPost'), highlight: 'brand' as const },
      ],
      read: false,
    },
    {
      id: '2',
      type: 'assessment',
      title: t('notif.main.newAssessment'),
      time: t('common.now'),
      body: [
        { text: t('notif.main.assessmentPre') },
        { text: t('notif.main.subjectPortuguese'), highlight: 'blue' as const },
        { text: t('notif.main.assessmentPost') },
      ],
      read: false,
    },
    {
      id: '3',
      type: 'schedule',
      title: t('notif.main.newSchedule'),
      time: '12:00',
      body: [
        { text: t('notif.main.schedulePre') },
        { text: 'Março/Abril', highlight: 'blue' as const },
        { text: '.' },
      ],
      read: false,
    },
    {
      id: '4',
      type: 'diary',
      title: t('notif.main.newDiaryNote'),
      time: '17:20 20 Jan 2025',
      body: [
        { text: t('notif.main.diaryPre') },
        { text: 'Mérito', highlight: 'violet' as const },
        { text: t('notif.main.diaryPost') },
      ],
      read: false,
    },
    {
      id: '5',
      type: 'book',
      title: t('notif.main.bookLoan'),
      time: '17:20 20 Jan 2025',
      body: [
        { text: t('notif.main.bookLoanPre') },
        { text: t('notif.main.bookTitle'), highlight: 'blue' as const },
        { text: '.' },
      ],
      read: true,
    },
    {
      id: '6',
      type: 'book',
      title: t('notif.main.bookReturn'),
      time: '17:20 20 Jan 2025',
      body: [
        { text: t('notif.main.bookReturnPre') },
        { text: t('notif.main.bookTitle'), highlight: 'blue' as const },
        { text: t('notif.main.bookReturnMid') },
        { text: '10/03/2025', highlight: 'brand' as const },
        { text: '.' },
      ],
      read: true,
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────

function NotifIcon({ type }: { type: NotifType }) {
  return (
    <View style={styles.iconBox}>
      {type === 'attendance' && (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M3 9V5h4M21 9V5h-4M3 15v4h4M21 15v4h-4"
            stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="9" cy="12" r="1.5" fill={colors.gray[400]} />
          <Circle cx="15" cy="12" r="1.5" fill={colors.gray[400]} />
          <Path d="M9 16 Q12 18.5 15 16"
            stroke={colors.gray[400]} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </Svg>
      )}
      {(type === 'assessment' || type === 'diary') && (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M9 12h6M9 16h4M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-5z"
            stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M14 3v5h5"
            stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )}
      {type === 'schedule' && (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M8 2v3M16 2v3M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
            stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )}
      {type === 'book' && (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 004 22H20V2H6.5A2.5 2.5 0 004 4.5v15z"
            stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )}
    </View>
  );
}

function RichText({ segments }: { segments: Segment[] }) {
  return (
    <Text style={styles.bodyText}>
      {segments.map((seg, i) => (
        <Text
          key={i}
          style={seg.highlight
            ? { color: HIGHLIGHT_COLORS[seg.highlight], fontWeight: '600' }
            : undefined}
        >
          {seg.text}
        </Text>
      ))}
    </Text>
  );
}

// ─── Bottom sheet: Presença ───────────────────────────────

function AttendanceSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useT();
  const slideAnim        = useRef(new Animated.Value(500)).current;
  const faceScanAnim     = useRef(new Animated.Value(0)).current;
  const faceScanOpacity  = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const { width: windowWidth } = useWindowDimensions();

  const scannerY = faceScanAnim.interpolate({ inputRange: [0, 1], outputRange: [-28, windowWidth + 28] });

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      slideAnim.setValue(500);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 500, duration: 220, useNativeDriver: true })
        .start(() => setModalVisible(false));
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      faceScanAnim.stopAnimation();
      faceScanOpacity.stopAnimation();
      faceScanAnim.setValue(0);
      faceScanOpacity.setValue(0);
      return;
    }
    faceScanAnim.setValue(0);
    faceScanOpacity.setValue(0);
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(faceScanAnim,    { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: false }),
        Animated.timing(faceScanOpacity, { toValue: 1, duration: 500,  useNativeDriver: false }),
        Animated.timing(faceScanOpacity, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(faceScanOpacity, { toValue: 0, duration: 400,  useNativeDriver: false }),
        Animated.timing(faceScanAnim,    { toValue: 0, duration: 300,  useNativeDriver: false }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [visible]);

  const fields = [
    { label: t('notif.statusLabel'),         value: t('common.present'),          badge: 'success' as const },
    { label: t('notif.dateTimeLabel'),        value: `${t('common.today').charAt(0).toUpperCase() + t('common.today').slice(1)}, 08:42` },
    { label: t('notif.schoolLabel'),          value: 'Escola José Amália' },
    { label: t('notif.classLabel'),           value: 'Pré I' },
    { label: t('notif.verificationMethod'),   value: t('turma.facialBiometrics') },
    { label: t('notif.biometricId'),          value: '19e8b065c0288506...' },
  ];

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable>
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.sheetHandle} />

            {/* Cabeçalho */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('notif.attendanceSheet')}</Text>
              <TouchableOpacity style={styles.sheetCloseBtn} onPress={onClose} activeOpacity={0.7}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12"
                    stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Face scan image + animação */}
            <View style={[styles.sheetFaceContainer, { width: windowWidth, height: windowWidth }]}>
              <Image
                source={require('@/assets/images/face-binary.png.png')}
                style={{ width: windowWidth, height: windowWidth }}
                resizeMode="cover"
              />
              <Svg
                width={windowWidth}
                height={windowWidth}
                viewBox="0 0 240 240"
                style={styles.sheetScanOverlay}
              >
                <Defs>
                  <SvgLinearGradient id="attendanceScanGreen" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0"   stopColor="#00E554" stopOpacity="0" />
                    <Stop offset="0.3" stopColor="#00E554" stopOpacity="0.22" />
                    <Stop offset="0.5" stopColor="#00E554" stopOpacity="0.9" />
                    <Stop offset="0.7" stopColor="#00E554" stopOpacity="0.22" />
                    <Stop offset="1"   stopColor="#00E554" stopOpacity="0" />
                  </SvgLinearGradient>
                </Defs>

                <AnimatedScanRect
                  x="0" y={scannerY} width="240" height="52"
                  fill="url(#attendanceScanGreen)"
                />

                <AnimatedScanG opacity={faceScanOpacity}>
                  <Circle cx="120" cy="120" r="58" fill="#00E554" opacity={0.06} />
                  <Circle cx="120" cy="120" r="46" fill="#00E554" opacity={0.09} />
                  <G transform="translate(120, 120) scale(0.73) translate(-59, -56)">
                    <SvgRect x="11.5" y="10"  width="95" height="92" rx="46" fill="#5CAC75" fillOpacity={0.28} />
                    <SvgRect x="11.5" y="10"  width="95" height="92" rx="46" fill="#FFFFFF" fillOpacity={0.12} />
                    <Path d="M 30 22 Q 59 14 88 22" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <SvgRect x="12" y="10.5" width="94" height="91" rx="45.5" stroke="rgba(255,255,255,0.32)" strokeWidth="1" fill="none" />
                    <Path d="M 30 88 Q 59 97 88 88" stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <Path
                      d="M54.6929 56.1366L57.5717 59.0154L64.049 52.5381M54.9836 68.5167C55.4553 68.4543 55.9319 68.5822 56.3077 68.8717L58.0396 70.2007C58.6121 70.6405 59.4085 70.6405 59.9794 70.2007L61.7769 68.8205C62.1128 68.563 62.5365 68.4495 62.9555 68.5055L65.204 68.8013C65.9188 68.8957 66.6081 68.4975 66.8848 67.8306L67.7499 65.7387C67.9114 65.3469 68.2217 65.0366 68.6135 64.8751L70.7052 64.0099C71.3721 63.7348 71.7703 63.0439 71.6759 62.329L71.3913 60.162C71.3289 59.6902 71.4568 59.2136 71.7463 58.8378L73.0752 57.1058C73.515 56.5332 73.515 55.7368 73.0752 55.1658L71.6951 53.3683C71.4377 53.0324 71.3241 52.6086 71.3801 52.1896L71.6759 49.941C71.7703 49.2261 71.3721 48.5368 70.7052 48.2602L68.6135 47.3949C68.2217 47.2334 67.9114 46.9232 67.7499 46.5313L66.8848 44.4395C66.6097 43.7726 65.9188 43.3743 65.204 43.4687L62.9555 43.7646C62.5365 43.8221 62.1128 43.7086 61.7785 43.4527L59.981 42.0725C59.4085 41.6327 58.6121 41.6327 58.0412 42.0725L56.2437 43.4527C55.9079 43.7086 55.4841 43.8221 55.0651 43.7678L52.8167 43.4719C52.1018 43.3775 51.4126 43.7758 51.1359 44.4427L50.2723 46.5345C50.1092 46.9247 49.799 47.235 49.4088 47.3981L47.317 48.2618C46.6502 48.5384 46.252 49.2277 46.3463 49.9426L46.6422 52.1912C46.6965 52.6102 46.583 53.034 46.3271 53.3683L44.947 55.1658C44.5072 55.7384 44.5072 56.5348 44.947 57.1058L46.3271 58.9034C46.5846 59.2392 46.6981 59.663 46.6422 60.082L46.3463 62.3306C46.252 63.0455 46.6502 63.7348 47.317 64.0115L49.4088 64.8767C49.8006 65.0382 50.1108 65.3485 50.2723 65.7403L51.1375 67.8322C51.4126 68.4991 52.1034 68.8973 52.8183 68.8029L54.9836 68.5167Z"
                      stroke="#008B00" strokeWidth="2.87879"
                      strokeLinecap="round" strokeLinejoin="round" fill="none"
                    />
                  </G>
                </AnimatedScanG>
              </Svg>
            </View>

            {/* Nome do aluno */}
            <View style={styles.sheetStudentRow}>
              <View style={styles.sheetStudentInfo}>
                <Text style={styles.sheetStudentName}>Thomas Vrisman Kopetski</Text>
                <Text style={styles.sheetStudentSub}>Pré I · Ensino Fundamental II</Text>
              </View>
            </View>

            {/* Campos */}
            <View style={styles.sheetFieldsGrid}>
              {fields.map(({ label, value, badge }) => (
                <View key={label} style={styles.sheetField}>
                  <Text style={styles.sheetFieldLabel}>{label}</Text>
                  {badge === 'success' ? (
                    <View style={styles.presenteBadge}>
                      <View style={styles.presenteDot} />
                      <Text style={styles.presenteText}>{value}</Text>
                    </View>
                  ) : (
                    <Text style={styles.sheetFieldValue}>{value}</Text>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Tela ─────────────────────────────────────────────────

export default function NotificacoesScreen() {
  const t = useT();
  const router = useRouter();
  const { setHideHeader, setUnreadNotificationsCount, language } = useApp();
  const [notifications, setNotifications] = useState(() => getMockNotifications(t));
  const [attendanceSheetVisible, setAttendanceSheetVisible] = useState(false);

  useEffect(() => {
    setNotifications(getMockNotifications(t));
  }, [language]);

  useEffect(() => {
    setHideHeader(true);
    return () => setHideHeader(false);
  }, []);

  const hasUnread = notifications.some((n) => !n.read);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadNotificationsCount(0);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(main)/boletim')}
          activeOpacity={0.7}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notif.title')}</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Lista */}
      <View style={styles.card}>
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View>
              <View style={styles.notifItem}>
                <NotifIcon type={item.type} />
                <View style={styles.notifContent}>
                  <View style={styles.notifTitleRow}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                  </View>
                  <RichText segments={item.body} />
                  {item.type === 'attendance' ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setAttendanceSheetVisible(true)}
                    >
                      <Text style={styles.conferirText}>{t('notif.check')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.conferirText}>{t('notif.check')}</Text>
                  )}
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
              {index < notifications.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          )}
        />
      </View>

      {/* Marcar todas como lidas */}
      <TouchableOpacity
        style={[styles.markAllBtn, !hasUnread && styles.markAllBtnDisabled]}
        onPress={markAllRead}
        disabled={!hasUnread}
        activeOpacity={0.7}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"
            stroke={hasUnread ? colors.brand[600] : colors.gray[400]}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={[styles.markAllText, !hasUnread && styles.markAllTextDisabled]}>
          {t('notif.markAll')}
        </Text>
      </TouchableOpacity>

      {/* Bottom sheet de presença */}
      <AttendanceSheet
        visible={attendanceSheetVisible}
        onClose={() => setAttendanceSheetVisible(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.gray[100],
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  card: {
    flex: 1,
    backgroundColor: colors.base.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: 4,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray[900],
  },
  notifTime: {
    fontSize: 12,
    color: colors.gray[400],
  },
  bodyText: {
    fontSize: 13,
    color: colors.gray[600],
    lineHeight: 20,
  },
  conferirText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brand[600],
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand[500],
    marginTop: 6,
    flexShrink: 0,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginHorizontal: 16,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    backgroundColor: colors.base.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  markAllBtnDisabled: {
    opacity: 0.45,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand[600],
  },
  markAllTextDisabled: {
    color: colors.gray[400],
  },

  // ── Bottom sheet ──────────────────────────────────────────
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.base.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[200],
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  sheetFaceContainer: {
    overflow: 'hidden',
  },
  sheetScanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  sheetStudentRow: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  sheetStudentInfo: {
    gap: 2,
  },
  sheetStudentName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray[900],
  },
  sheetStudentSub: {
    fontSize: 13,
    color: colors.gray[500],
  },
  sheetFieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 20,
  },
  sheetField: {
    width: '45%',
    gap: 4,
  },
  sheetFieldLabel: {
    fontSize: 12,
    color: colors.gray[400],
    fontWeight: '400',
  },
  sheetFieldValue: {
    fontSize: 14,
    color: colors.gray[900],
    fontWeight: '500',
  },
  presenteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presenteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success[500],
  },
  presenteText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success[700],
  },
});
