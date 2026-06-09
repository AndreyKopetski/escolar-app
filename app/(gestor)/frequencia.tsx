import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

// ─── Mock data ────────────────────────────────────────────

const TURMAS = [
  { nome: 'Pré I – A',   alunos: 22, presentes: 20, professor: 'Ana Souza' },
  { nome: 'Pré I – B',   alunos: 21, presentes: 18, professor: 'Carlos Lima' },
  { nome: 'Pré II – A',  alunos: 24, presentes: 23, professor: 'Marta Oliveira' },
  { nome: '1º Ano – A',  alunos: 28, presentes: 25, professor: 'João Pereira' },
  { nome: '1º Ano – B',  alunos: 27, presentes: 24, professor: 'Fernanda Costa' },
  { nome: '2º Ano – A',  alunos: 26, presentes: 22, professor: 'Paulo Mendes' },
  { nome: '2º Ano – B',  alunos: 25, presentes: 21, professor: 'Sílvia Rocha' },
  { nome: '3º Ano – A',  alunos: 29, presentes: 27, professor: 'Ricardo Alves' },
  { nome: '4º Ano – A',  alunos: 28, presentes: 20, professor: 'Beatriz Nunes' },
  { nome: '5º Ano – A',  alunos: 30, presentes: 29, professor: 'Gustavo Faria' },
];

const PROFESSORES = [
  { nome: 'Ana Souza',      disciplina: 'Educação Infantil', status: 'presente', entrada: '07:30', saida: '12:30' },
  { nome: 'Carlos Lima',    disciplina: 'Educação Infantil', status: 'presente', entrada: '07:28', saida: '12:30' },
  { nome: 'Marta Oliveira', disciplina: 'Educação Infantil', status: 'falta',    entrada: '—',     saida: '—' },
  { nome: 'João Pereira',   disciplina: 'Matemática',        status: 'presente', entrada: '07:35', saida: '17:00' },
  { nome: 'Fernanda Costa', disciplina: 'Português',         status: 'presente', entrada: '07:31', saida: '17:00' },
  { nome: 'Paulo Mendes',   disciplina: 'Ciências',          status: 'atraso',   entrada: '08:12', saida: '17:00' },
  { nome: 'Sílvia Rocha',   disciplina: 'História',          status: 'presente', entrada: '07:29', saida: '17:00' },
  { nome: 'Ricardo Alves',  disciplina: 'Geografia',         status: 'presente', entrada: '07:33', saida: '17:00' },
  { nome: 'Beatriz Nunes',  disciplina: 'Artes',             status: 'falta',    entrada: '—',     saida: '—' },
  { nome: 'Gustavo Faria',  disciplina: 'Ed. Física',        status: 'presente', entrada: '07:30', saida: '17:00' },
];

// ─── Components ───────────────────────────────────────────

type Tab = 'turmas' | 'docentes';

function TabBar({ value, onChange }: { value: Tab; onChange: (tab: Tab) => void }) {
  const t = useT();
  const tabs: { key: Tab; label: string }[] = [
    { key: 'turmas',   label: t('freq.byClass') },
    { key: 'docentes', label: t('freq.teachers') },
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

function SummaryBar({ presentes, total }: { presentes: number; total: number }) {
  const t   = useT();
  const pct = Math.round((presentes / total) * 100);
  return (
    <View style={s.summaryBar}>
      {[
        { v: String(total),             l: t('freq.total'),          c: colors.gray[900] },
        { v: String(presentes),         l: t('freq.presentes'),      c: colors.success[600] },
        { v: String(total - presentes), l: t('freq.ausentes'),       c: colors.error[500] },
        { v: `${pct}%`,                 l: t('freq.percentPresenca'), c: colors.brand[600] },
      ].map((item, i, arr) => (
        <View key={item.l} style={{ flexDirection: 'row', flex: 1 }}>
          <View style={s.summaryItem}>
            <Text style={[s.summaryValue, { color: item.c }]}>{item.v}</Text>
            <Text style={s.summaryLabel}>{item.l}</Text>
          </View>
          {i < arr.length - 1 && <View style={s.summaryDivider} />}
        </View>
      ))}
    </View>
  );
}

function TurmaRow({ turma }: { turma: typeof TURMAS[0] }) {
  const t        = useT();
  const router   = useRouter();
  const pct      = Math.round((turma.presentes / turma.alunos) * 100);
  const barColor = pct >= 90 ? colors.success[500] : pct >= 75 ? colors.warning[400] : colors.error[400];
  return (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.8}
      onPress={() => router.push({
        pathname: '/(gestor)/turma-detalhe',
        params: { nome: turma.nome, professor: turma.professor, alunos: String(turma.alunos), presentes: String(turma.presentes) },
      })}
    >
      <View style={s.turmaHeader}>
        <View>
          <Text style={s.turmaName}>{turma.nome}</Text>
          <Text style={s.turmaProf}>{turma.professor}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[s.turmaPct, { color: barColor }]}>{pct}%</Text>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke={colors.gray[300]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      </View>
      <Text style={s.turmaStatText}>
        <Text style={s.turmaStatBold}>{turma.presentes}</Text> {t('freq.presentes')} ·{' '}
        <Text style={{ color: colors.error[500] }}>{turma.alunos - turma.presentes}</Text> {t('freq.ausentes')}
      </Text>
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
      </View>
    </TouchableOpacity>
  );
}

function ProfessorRow({ prof }: { prof: typeof PROFESSORES[0] }) {
  const t           = useT();
  const statusColor = prof.status === 'presente' ? colors.success[600] : prof.status === 'atraso' ? colors.warning[600] : colors.error[500];
  const statusBg    = prof.status === 'presente' ? colors.success[50]  : prof.status === 'atraso' ? colors.warning[50]  : colors.error[50];
  const statusLabel = prof.status === 'presente' ? t('common.present') : prof.status === 'atraso' ? t('common.delay') : t('common.absent');
  return (
    <View style={s.card}>
      <View style={s.profRow}>
        <View style={s.profAvatar}>
          <Text style={s.profInitials}>{prof.nome.split(' ').map(w => w[0]).slice(0, 2).join('')}</Text>
        </View>
        <View style={s.profInfo}>
          <Text style={s.profName}>{prof.nome}</Text>
          <Text style={s.profDisc}>{prof.disciplina}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: statusBg }]}>
          <Text style={[s.badgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
      {prof.status !== 'falta' && (
        <View style={s.pontoPill}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke={colors.gray[400]} strokeWidth="2" />
            <Path d="M12 7v5l3 3" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={s.pontoText}>{t('freq.entry', { h: prof.entrada, s: prof.saida })}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────

export default function FrequenciaScreen() {
  const [tab, setTab] = useState<Tab>('turmas');
  const totalAlunos    = TURMAS.reduce((a, t) => a + t.alunos, 0);
  const totalPresentes = TURMAS.reduce((a, t) => a + t.presentes, 0);
  const profPresentes  = PROFESSORES.filter(p => p.status !== 'falta').length;

  return (
    <View style={s.container}>
      <View style={s.body}>
        <TabBar value={tab} onChange={setTab} />
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'turmas' ? (
            <>
              <SummaryBar presentes={totalPresentes} total={totalAlunos} />
              {TURMAS.map((t) => <TurmaRow key={t.nome} turma={t} />)}
            </>
          ) : (
            <>
              <SummaryBar presentes={profPresentes} total={PROFESSORES.length} />
              {PROFESSORES.map((p) => <ProfessorRow key={p.nome} prof={p} />)}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[100] },
  body:      { flex: 1, backgroundColor: colors.base.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },

  pageHeader: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  pageTitle:  { fontSize: 22, fontWeight: '800', color: colors.gray[900] },
  pageSub:    { fontSize: 13, color: colors.gray[500], marginTop: 2 },

  tabRow:        { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 16 },
  tab:           { flex: 1, height: 32, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.gray[100] },
  tabActive:     { backgroundColor: colors.success[100] },
  tabText:       { fontSize: 13, fontWeight: '600', color: colors.gray[500] },
  tabTextActive: { color: colors.brand[700] },

  scroll: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },

  summaryBar:     { flexDirection: 'row', backgroundColor: colors.gray[50], borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.gray[100] },
  summaryItem:    { flex: 1, alignItems: 'center', gap: 2 },
  summaryDivider: { width: 1, backgroundColor: colors.gray[200] },
  summaryValue:   { fontSize: 22, fontWeight: '800' },
  summaryLabel:   { fontSize: 11, color: colors.gray[500] },

  card: { backgroundColor: colors.base.white, borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.gray[300] },

  turmaHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  turmaName:     { fontSize: 15, fontWeight: '700', color: colors.gray[900] },
  turmaProf:     { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  turmaPct:      { fontSize: 24, fontWeight: '800' },
  turmaStatText: { fontSize: 13, color: colors.gray[500] },
  turmaStatBold: { fontWeight: '700', color: colors.gray[800] },
  progressTrack: { height: 6, backgroundColor: colors.gray[100], borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: 6, borderRadius: 3 },

  profRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profAvatar:   { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brand[100], alignItems: 'center', justifyContent: 'center' },
  profInitials: { fontSize: 16, fontWeight: '700', color: colors.brand[700] },
  profInfo:     { flex: 1, gap: 2 },
  profName:     { fontSize: 15, fontWeight: '600', color: colors.gray[900] },
  profDisc:     { fontSize: 12, color: colors.gray[500] },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:    { fontSize: 12, fontWeight: '600' },
  pontoPill:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.gray[50], borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  pontoText:    { fontSize: 12, color: colors.gray[500] },
});
