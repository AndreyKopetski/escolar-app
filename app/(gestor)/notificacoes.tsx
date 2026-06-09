import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useApp } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

// ─── Types ────────────────────────────────────────────────

type HighlightColor = 'brand' | 'blue' | 'violet' | 'error' | 'warning';
type Segment = { text: string; highlight?: HighlightColor };
type NotifType = 'frequencia' | 'evasao' | 'agenda' | 'docentes' | 'alunos' | 'relatorios' | 'merenda';

type Notification = {
  id: string;
  type: NotifType;
  title: string;
  time: string;
  body: Segment[];
  route: string;
  read: boolean;
};

// ─── Mock data ────────────────────────────────────────────

const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  brand:   colors.brand[700],
  blue:    colors.blue[600],
  violet:  colors.violet[600],
  error:   colors.error[600],
  warning: colors.warning[700],
};

type TFn = (key: string) => string;

function getMockNotifications(t: TFn): Notification[] {
  return [
    {
      id: '1', type: 'evasao', read: false, time: t('common.now'),
      route: '/(gestor)/relatorios',
      title: t('notif.gestor.criticalEvasion'),
      body: [
        { text: t('notif.gestor.evasionPre') },
        { text: 'Lucas Ferreira', highlight: 'error' as const },
        { text: ' (4º Ano – A)' + t('notif.gestor.evasionMid') },
        { text: '47%' + t('notif.gestor.evasionFaults'), highlight: 'error' as const },
        { text: t('notif.gestor.evasionPost') },
      ],
    },
    {
      id: '2', type: 'frequencia', read: false, time: t('common.now'),
      route: '/(gestor)/frequencia',
      title: t('notif.gestor.lowAttendance'),
      body: [
        { text: t('notif.gestor.lowAttendPre') },
        { text: '4º Ano – A', highlight: 'warning' as const },
        { text: t('notif.gestor.lowAttendMid') },
        { text: '71% ' + t('notif.gestor.ofPresence'), highlight: 'warning' as const },
        { text: t('notif.gestor.lowAttendPost') },
      ],
    },
    {
      id: '3', type: 'docentes', read: false, time: '14 min',
      route: '/(gestor)/mais',
      title: t('notif.gestor.teachersAbsent'),
      body: [
        { text: 'Marta Oliveira', highlight: 'brand' as const },
        { text: t('notif.gestor.teachersAnd') },
        { text: 'Beatriz Nunes', highlight: 'brand' as const },
        { text: t('notif.gestor.teachersPost') },
      ],
    },
    {
      id: '4', type: 'agenda', read: false, time: '1h',
      route: '/(gestor)/agenda',
      title: t('notif.gestor.classMeeting'),
      body: [
        { text: t('notif.gestor.meetingPre') },
        { text: '1º e 2º ano', highlight: 'blue' as const },
        { text: t('notif.gestor.meetingMid') },
        { text: '14h00', highlight: 'blue' as const },
        { text: t('notif.gestor.meetingPost') },
      ],
    },
    {
      id: '5', type: 'relatorios', read: false, time: '2h',
      route: '/(gestor)/mais',
      title: t('notif.gestor.gradeDeadline'),
      body: [
        { text: t('notif.gestor.gradePre') },
        { text: '1º bimestre', highlight: 'blue' as const },
        { text: t('notif.gestor.gradeMid') },
        { text: '2 dias', highlight: 'error' as const },
        { text: t('notif.gestor.gradePost') },
      ],
    },
    {
      id: '6', type: 'alunos', read: true, time: '3h',
      route: '/(gestor)/alunos',
      title: t('notif.gestor.biometricPending'),
      body: [
        { text: t('notif.gestor.biometricPre') },
        { text: t('notif.gestor.biometricPost') },
      ],
    },
    {
      id: '7', type: 'docentes', read: true, time: '4h',
      route: '/(gestor)/mais',
      title: t('notif.gestor.diaryPending'),
      body: [
        { text: 'Paulo Mendes', highlight: 'brand' as const },
        { text: t('notif.gestor.teachersAnd') },
        { text: 'Marta Oliveira', highlight: 'brand' as const },
        { text: t('notif.gestor.diaryMid') },
        { text: '3 dias', highlight: 'warning' as const },
        { text: t('notif.gestor.diaryPost') },
      ],
    },
    {
      id: '8', type: 'merenda', read: true, time: t('common.yesterday'),
      route: '/(gestor)/relatorios',
      title: t('notif.gestor.lowMerenda'),
      body: [
        { text: t('notif.gestor.merendaPre') },
        { text: '230 refeições', highlight: 'warning' as const },
        { text: t('notif.gestor.merendaPost') },
      ],
    },
    {
      id: '9', type: 'agenda', read: true, time: t('common.yesterday'),
      route: '/(gestor)/agenda',
      title: t('notif.gestor.parentMeeting'),
      body: [
        { text: t('notif.gestor.parentPre') },
        { text: '14/06', highlight: 'blue' as const },
        { text: t('notif.gestor.parentPost') },
      ],
    },
    {
      id: '10', type: 'relatorios', read: true, time: t('common.yesterday'),
      route: '/(gestor)/relatorios',
      title: t('notif.gestor.belowAvg'),
      body: [
        { text: '4º Ano – A', highlight: 'error' as const },
        { text: t('notif.gestor.belowAvgMid') },
        { text: '6.4', highlight: 'error' as const },
        { text: t('notif.gestor.belowAvgPost') },
      ],
    },
    {
      id: '11', type: 'evasao', read: true, time: '2 dias',
      route: '/(gestor)/relatorios',
      title: t('notif.gestor.newRisk'),
      body: [
        { text: 'Isabela Santos', highlight: 'error' as const },
        { text: t('notif.gestor.teachersAnd') },
        { text: 'Pedro Almeida', highlight: 'error' as const },
        { text: t('notif.gestor.newRiskPost') },
        { text: '30%' + t('notif.gestor.evasionFaults'), highlight: 'error' as const },
        { text: t('notif.gestor.inTheMonth') },
      ],
    },
    {
      id: '12', type: 'agenda', read: true, time: '3 dias',
      route: '/(gestor)/agenda',
      title: t('notif.gestor.mecDeadline'),
      body: [
        { text: t('notif.gestor.mecPre') },
        { text: '15/06', highlight: 'blue' as const },
        { text: '.' },
      ],
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────

function NotifIcon({ type }: { type: NotifType }) {
  return (
    <View style={styles.iconBox}>
      {type === 'frequencia' && (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={colors.gray[400]} strokeWidth="2" />
          <Path d="M12 7v5l3 3" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      )}
      {type === 'evasao' && (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )}
      {type === 'agenda' && (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M8 2v3M16 2v3M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
            stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )}
      {type === 'docentes' && (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M9 12h6M9 16h4M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-5zM14 3v5h5"
            stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )}
      {type === 'alunos' && (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M3 9V5h4M21 9V5h-4M3 15v4h4M21 15v4h-4"
            stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="9" cy="12" r="1.5" fill={colors.gray[400]} />
          <Circle cx="15" cy="12" r="1.5" fill={colors.gray[400]} />
          <Path d="M9 16 Q12 18.5 15 16" stroke={colors.gray[400]} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </Svg>
      )}
      {type === 'relatorios' && (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M9 12h6M9 16h4M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-5z"
            stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M14 3v5h5" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )}
      {type === 'merenda' && (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"
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
        <Text key={i} style={seg.highlight ? { color: HIGHLIGHT_COLORS[seg.highlight], fontWeight: '600' } : undefined}>
          {seg.text}
        </Text>
      ))}
    </Text>
  );
}

// ─── Tela ─────────────────────────────────────────────────

export default function GestorNotificacoesScreen() {
  const t      = useT();
  const router = useRouter();
  const { setHideHeader, setUnreadNotificationsCount, language } = useApp();
  const [notifications, setNotifications] = useState(() => getMockNotifications(t));

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
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(gestor)/dashboard')}
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
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setNotifications((prev) => prev.map((n) => n.id === item.id ? { ...n, read: true } : n));
                      router.push(item.route as any);
                    }}
                  >
                    <Text style={styles.conferirText}>{t('notif.check')}</Text>
                  </TouchableOpacity>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
              {index < notifications.length - 1 && <View style={styles.separator} />}
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
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[100] },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.gray[100],
  },
  backBtn:     { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: colors.gray[900] },

  card: { flex: 1, backgroundColor: colors.base.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },

  notifItem:    { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  iconBox:      { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifContent: { flex: 1, gap: 4 },
  notifTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  notifTitle:   { fontSize: 14, fontWeight: '700', color: colors.gray[900] },
  notifTime:    { fontSize: 12, color: colors.gray[400] },
  bodyText:     { fontSize: 13, color: colors.gray[600], lineHeight: 20 },
  conferirText: { fontSize: 13, fontWeight: '600', color: colors.brand[600], marginTop: 2 },
  unreadDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand[500], marginTop: 6, flexShrink: 0 },
  separator:    { height: 1, backgroundColor: colors.gray[100], marginHorizontal: 16 },

  markAllBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18, backgroundColor: colors.base.white, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  markAllBtnDisabled: { opacity: 0.45 },
  markAllText:        { fontSize: 14, fontWeight: '600', color: colors.brand[600] },
  markAllTextDisabled:{ color: colors.gray[400] },
});
