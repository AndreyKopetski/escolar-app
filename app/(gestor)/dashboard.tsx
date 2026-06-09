import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

// ─── Mock data ────────────────────────────────────────────

const ESCOLA = {
  totalAlunos: 273, presentes: 245, faltantes: 28,
  refeicoes: 245, professores: 18, profPresentes: 16,
  evasao: 4, turmas: 12,
};

const REDE = {
  totalAlunos: 4820, presentes: 4391, faltantes: 429,
  escolas: 18, refeicoes: 4391, professores: 312, profPresentes: 298,
  evasao: 67,
};

const REDE_ESCOLAS = [
  { nome: 'E.M. José Amália',   pct: 91, alunos: 273 },
  { nome: 'E.M. Santos Dumont', pct: 87, alunos: 318 },
  { nome: 'E.M. Tiradentes',    pct: 94, alunos: 291 },
  { nome: 'E.M. Dom Pedro II',  pct: 79, alunos: 265 },
  { nome: 'E.M. Rui Barbosa',   pct: 88, alunos: 307 },
];

// ─── Tab bar (estilo BimestreTabs) ────────────────────────

type ViewMode = 'escola' | 'rede';

function TabBar({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  const t = useT();
  const tabs: { key: ViewMode; label: string }[] = [
    { key: 'escola', label: t('dashboard.escola') },
    { key: 'rede',   label: t('dashboard.rede') },
  ];
  return (
    <View style={s.tabRow}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab.key} style={[s.tab, value === tab.key && s.tabActive]}
          onPress={() => onChange(tab.key)} activeOpacity={0.7}>
          {value === tab.key && (
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17l-5-5" stroke={colors.brand[700]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
          <Text style={[s.tabText, value === tab.key && s.tabTextActive]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Card components ─────────────────────────────────────

function SmallCard({ label, value, sub, iconBg, icon }: {
  label: string; value: string; sub: string; iconBg: string; icon: React.ReactNode;
}) {
  return (
    <View style={s.smallCard}>
      <View style={[s.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={s.smallLabel}>{label}</Text>
      <Text style={s.bigValue}>{value}</Text>
      <Text style={s.subText}>{sub}</Text>
    </View>
  );
}

function WideCard({ label, value, sub, iconBg, icon, progress, children }: {
  label: string; value: string; sub?: string; iconBg: string; icon: React.ReactNode;
  progress?: number; children?: React.ReactNode;
}) {
  return (
    <View style={s.wideCard}>
      <View style={s.wideTop}>
        <Text style={s.wideLabel}>{label}</Text>
        <View style={[s.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
      </View>
      <Text style={s.bigValue}>{value}</Text>
      {progress !== undefined && (
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress}%` as any }]} />
        </View>
      )}
      {sub && <Text style={s.subText}>{sub}</Text>}
      {children}
    </View>
  );
}

// ─── Views ────────────────────────────────────────────────

function EscolaView() {
  const t       = useT();
  const pct     = Math.round((ESCOLA.presentes / ESCOLA.totalAlunos) * 100);
  const profPct = Math.round((ESCOLA.profPresentes / ESCOLA.professores) * 100);
  return (
    <>
      <View style={s.row}>
        <SmallCard label={t('dashboard.studentsPresent')} value={String(ESCOLA.presentes)}
          sub={t('dashboard.enrolledOf', { n: ESCOLA.totalAlunos })} iconBg={colors.success[100]}
          icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke={colors.success[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="9" cy="7" r="4" stroke={colors.success[600]} strokeWidth="2" />
            <Path d="M17 11l2 2 4-4" stroke={colors.success[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>}
        />
        <SmallCard label={t('dashboard.studentsMissing')} value={String(ESCOLA.faltantes)}
          sub={`${Math.round((ESCOLA.faltantes / ESCOLA.totalAlunos) * 100)}% ${t('dashboard.ofTotal').replace('% ', '')}`} iconBg={colors.error[100]}
          icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke={colors.error[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="9" cy="7" r="4" stroke={colors.error[500]} strokeWidth="2" />
            <Path d="M18 8l4 4M22 8l-4 4" stroke={colors.error[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>}
        />
      </View>
      <WideCard label={t('dashboard.attendance')} value={`${pct}%`} progress={pct}
        sub={t('dashboard.classesToday', { n: ESCOLA.turmas })} iconBg={colors.blue[100]}
        icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={colors.blue[500]} strokeWidth="2" />
          <Path d="M12 7v5l3 3" stroke={colors.blue[500]} strokeWidth="2" strokeLinecap="round" />
        </Svg>}
      />
      <WideCard label={t('dashboard.meals')} value={String(ESCOLA.refeicoes)}
        sub={t('dashboard.mealsSub')} iconBg={colors.warning[100]}
        icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" stroke={colors.warning[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>}
      />
      <View style={s.row}>
        <SmallCard label={t('dashboard.teachers')} value={`${ESCOLA.profPresentes}/${ESCOLA.professores}`}
          sub={t('dashboard.teachersPresent', { p: profPct })} iconBg={colors.violet[100]}
          icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={colors.violet[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="9" cy="7" r="4" stroke={colors.violet[600]} strokeWidth="2" />
            <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={colors.violet[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>}
        />
        <SmallCard label={t('dashboard.atRisk')} value={String(ESCOLA.evasao)}
          sub={t('dashboard.atRiskSub')} iconBg={colors.warning[100]}
          icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={colors.warning[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>}
        />
      </View>
    </>
  );
}

function RedeView() {
  const t       = useT();
  const pct     = Math.round((REDE.presentes / REDE.totalAlunos) * 100);
  const profPct = Math.round((REDE.profPresentes / REDE.professores) * 100);
  return (
    <>
      <View style={s.row}>
        <SmallCard label={t('dashboard.totalStudents')} value={REDE.totalAlunos.toLocaleString('pt-BR')}
          sub={t('dashboard.schools', { n: REDE.escolas })} iconBg={colors.blue[100]}
          icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={colors.blue[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M9 21V12h6v9" stroke={colors.blue[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>}
        />
        <SmallCard label={t('dashboard.atRisk')} value={String(REDE.evasao)}
          sub={t('dashboard.networkAll')} iconBg={colors.error[100]}
          icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={colors.error[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>}
        />
      </View>
      <WideCard label={t('dashboard.networkAttendance')} value={`${pct}%`} progress={pct}
        sub={`${REDE.presentes.toLocaleString('pt-BR')} ${t('dashboard.of')} ${REDE.totalAlunos.toLocaleString('pt-BR')} alunos`}
        iconBg={colors.success[100]}
        icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={colors.success[600]} strokeWidth="2" />
          <Path d="M12 7v5l3 3" stroke={colors.success[600]} strokeWidth="2" strokeLinecap="round" />
        </Svg>}>
        <View style={s.divider} />
        {REDE_ESCOLAS.map((e) => (
          <View key={e.nome} style={s.escolaRow}>
            <Text style={s.escolaNome} numberOfLines={1}>{e.nome}</Text>
            <View style={s.escolaBarWrap}>
              <View style={[s.escolaBar, { width: `${e.pct}%` as any,
                backgroundColor: e.pct >= 90 ? colors.success[500] : e.pct >= 80 ? colors.warning[400] : colors.error[400] }]} />
            </View>
            <Text style={s.escolaPct}>{e.pct}%</Text>
          </View>
        ))}
      </WideCard>
      <View style={s.row}>
        <SmallCard label={t('dashboard.activeTeachers')} value={`${REDE.profPresentes}/${REDE.professores}`}
          sub={t('dashboard.teachersPresent', { p: profPct })} iconBg={colors.violet[100]}
          icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={colors.violet[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="9" cy="7" r="4" stroke={colors.violet[600]} strokeWidth="2" />
            <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={colors.violet[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>}
        />
        <SmallCard label={t('dashboard.mealsNetwork')} value={REDE.refeicoes.toLocaleString('pt-BR')}
          sub={t('dashboard.networkAll')} iconBg={colors.warning[100]}
          icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" stroke={colors.warning[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>}
        />
      </View>
    </>
  );
}

// ─── Tela ─────────────────────────────────────────────────

export default function GestorDashboard() {
  const [view, setView] = useState<ViewMode>('escola');
  return (
    <View style={s.container}>
      <View style={s.body}>
        <TabBar value={view} onChange={setView} />
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {view === 'escola' ? <EscolaView /> : <RedeView />}
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[100] },
  body: { flex: 1, backgroundColor: colors.base.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },

  tabRow:        { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 16 },
  tab:           { flex: 1, height: 32, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.gray[100] },
  tabActive:     { backgroundColor: colors.success[100] },
  tabText:       { fontSize: 13, fontWeight: '600', color: colors.gray[500] },
  tabTextActive: { color: colors.brand[700] },

  scroll: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  row:    { flexDirection: 'row', gap: 12 },

  smallCard: { flex: 1, backgroundColor: colors.base.white, borderRadius: 16, padding: 16, gap: 6, borderWidth: 1, borderColor: colors.gray[300] },
  wideCard:  { backgroundColor: colors.base.white, borderRadius: 16, padding: 16, gap: 8, borderWidth: 1, borderColor: colors.gray[300] },
  wideTop:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBox:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  smallLabel:    { fontSize: 13, fontWeight: '500', color: colors.gray[600], lineHeight: 18 },
  wideLabel:     { fontSize: 13, fontWeight: '600', color: colors.gray[700] },
  bigValue:      { fontSize: 32, fontWeight: '800', color: colors.gray[900], lineHeight: 38 },
  subText:       { fontSize: 12, color: colors.gray[400] },
  progressTrack: { height: 8, backgroundColor: colors.gray[100], borderRadius: 4, overflow: 'hidden' },
  progressFill:  { height: 8, borderRadius: 4, backgroundColor: colors.brand[500] },

  divider:      { height: 1, backgroundColor: colors.gray[100], marginVertical: 4 },
  escolaRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  escolaNome:   { fontSize: 12, color: colors.gray[600], width: 120 },
  escolaBarWrap:{ flex: 1, height: 6, backgroundColor: colors.gray[100], borderRadius: 3, overflow: 'hidden' },
  escolaBar:    { height: 6, borderRadius: 3 },
  escolaPct:    { fontSize: 12, fontWeight: '600', color: colors.gray[700], width: 32, textAlign: 'right' },
});
