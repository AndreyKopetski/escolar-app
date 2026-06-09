import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

// ─── Mock data por período ────────────────────────────────

type Period = 'semanal' | 'mensal' | 'bimestral';

const EVASAO: Record<Period, { nome: string; turma: string; faltas: number; pct: number }[]> = {
  semanal: [
    { nome: 'Lucas Ferreira',   turma: '4º Ano – A', faltas: 3, pct: 60 },
    { nome: 'Isabela Santos',   turma: '2º Ano – B', faltas: 2, pct: 40 },
  ],
  mensal: [
    { nome: 'Lucas Ferreira',   turma: '4º Ano – A', faltas: 14, pct: 47 },
    { nome: 'Isabela Santos',   turma: '2º Ano – B', faltas: 11, pct: 37 },
    { nome: 'Pedro Almeida',    turma: '5º Ano – A', faltas: 9,  pct: 30 },
    { nome: 'Camila Rodrigues', turma: '3º Ano – A', faltas: 8,  pct: 27 },
    { nome: 'Thiago Carvalho',  turma: '1º Ano – B', faltas: 8,  pct: 27 },
  ],
  bimestral: [
    { nome: 'Lucas Ferreira',   turma: '4º Ano – A', faltas: 24, pct: 80 },
    { nome: 'Isabela Santos',   turma: '2º Ano – B', faltas: 19, pct: 63 },
    { nome: 'Pedro Almeida',    turma: '5º Ano – A', faltas: 16, pct: 53 },
    { nome: 'Camila Rodrigues', turma: '3º Ano – A', faltas: 14, pct: 47 },
    { nome: 'Thiago Carvalho',  turma: '1º Ano – B', faltas: 13, pct: 43 },
    { nome: 'Renata Moura',     turma: '3º Ano – A', faltas: 11, pct: 37 },
    { nome: 'Diego Santana',    turma: '2º Ano – A', faltas: 10, pct: 33 },
    { nome: 'Patrícia Leal',    turma: '1º Ano – A', faltas: 9,  pct: 30 },
  ],
};

const MERENDA: Record<Period, { label: string; servidas: number }[]> = {
  semanal: [
    { label: 'Segunda-feira', servidas: 241 },
    { label: 'Terça-feira',   servidas: 238 },
    { label: 'Quarta-feira',  servidas: 245 },
    { label: 'Quinta-feira',  servidas: 230 },
    { label: 'Sexta-feira',   servidas: 235 },
  ],
  mensal: [
    { label: 'Semana 1', servidas: 1189 },
    { label: 'Semana 2', servidas: 1203 },
    { label: 'Semana 3', servidas: 1175 },
    { label: 'Semana 4', servidas: 1218 },
  ],
  bimestral: [
    { label: 'Abril', servidas: 4820 },
    { label: 'Maio',  servidas: 4785 },
  ],
};

const MERENDA_META: Record<Period, { totalLabel: string; mediaLabel: string }> = {
  semanal:   { totalLabel: 'rel.weekTotal',  mediaLabel: 'rel.dailyAvg' },
  mensal:    { totalLabel: 'rel.monthTotal', mediaLabel: 'rel.weeklyAvg' },
  bimestral: { totalLabel: 'rel.biTotal',    mediaLabel: 'rel.monthlyAvg' },
};

const DESEMPENHO: Record<Period, { turma: string; media: number }[]> = {
  semanal: [
    { turma: 'Pré I – A',  media: 8.6 },
    { turma: 'Pré II – A', media: 8.3 },
    { turma: '1º Ano – A', media: 7.9 },
    { turma: '1º Ano – B', media: 8.1 },
    { turma: '2º Ano – A', media: 7.0 },
    { turma: '2º Ano – B', media: 7.4 },
    { turma: '3º Ano – A', media: 8.2 },
    { turma: '4º Ano – A', media: 6.7 },
    { turma: '5º Ano – A', media: 8.0 },
  ],
  mensal: [
    { turma: 'Pré I – A',  media: 8.4 },
    { turma: 'Pré II – A', media: 8.1 },
    { turma: '1º Ano – A', media: 7.6 },
    { turma: '1º Ano – B', media: 7.9 },
    { turma: '2º Ano – A', media: 6.8 },
    { turma: '2º Ano – B', media: 7.2 },
    { turma: '3º Ano – A', media: 8.0 },
    { turma: '4º Ano – A', media: 6.4 },
    { turma: '5º Ano – A', media: 7.8 },
  ],
  bimestral: [
    { turma: 'Pré I – A',  media: 8.2 },
    { turma: 'Pré II – A', media: 7.9 },
    { turma: '1º Ano – A', media: 7.3 },
    { turma: '1º Ano – B', media: 7.6 },
    { turma: '2º Ano – A', media: 6.5 },
    { turma: '2º Ano – B', media: 6.9 },
    { turma: '3º Ano – A', media: 7.7 },
    { turma: '4º Ano – A', media: 6.1 },
    { turma: '5º Ano – A', media: 7.5 },
  ],
};

// ─── Period tab ───────────────────────────────────────────

function PeriodTabs({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const t = useT();
  const tabs: { key: Period; label: string }[] = [
    { key: 'semanal',   label: t('rel.weekly') },
    { key: 'mensal',    label: t('rel.monthly') },
    { key: 'bimestral', label: t('rel.bimonthly') },
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


// ─── Report cards ─────────────────────────────────────────

function EvasaoCard({ period }: { period: Period }) {
  const t      = useT();
  const alunos = EVASAO[period];
  const total  = alunos.reduce((a, r) => a + r.faltas, 0);
  return (
    <View style={s.reportCard}>
      <Text style={s.sectionTitle}>{t('rel.evasion')}</Text>
      <View style={s.metricsRow}>
        <View style={s.metricItem}>
          <Text style={[s.metricValue, { color: colors.error[500] }]}>{alunos.length}</Text>
          <Text style={s.metricLabel}>{t('rel.atRisk')}</Text>
        </View>
        <View style={s.metricDivider} />
        <View style={s.metricItem}>
          <Text style={[s.metricValue, { color: colors.warning[600] }]}>{total}</Text>
          <Text style={s.metricLabel}>{t('rel.accFaults')}</Text>
        </View>
        <View style={s.metricDivider} />
        <View style={s.metricItem}>
          <Text style={[s.metricValue, { color: colors.gray[700] }]}>25%</Text>
          <Text style={s.metricLabel}>{t('rel.legalLimit')}</Text>
        </View>
      </View>
      <View style={s.divider} />
      {alunos.map((a) => (
        <View key={a.nome} style={s.listRow}>
          <View style={s.listAvatar}>
            <Text style={s.listInitials}>{a.nome.split(' ').map(w => w[0]).slice(0, 2).join('')}</Text>
          </View>
          <View style={s.listInfo}>
            <Text style={s.listName}>{a.nome}</Text>
            <Text style={s.listSub}>{a.turma}</Text>
          </View>
          <View style={[s.riskBadge, { backgroundColor: a.pct >= 40 ? colors.error[100] : colors.warning[100] }]}>
            <Text style={[s.riskText, { color: a.pct >= 40 ? colors.error[600] : colors.warning[700] }]}>{a.pct}%</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function MerendaCard({ period }: { period: Period }) {
  const t      = useT();
  const dias   = MERENDA[period];
  const meta   = MERENDA_META[period];
  const total  = dias.reduce((a, d) => a + d.servidas, 0);
  const maxVal = Math.max(...dias.map(d => d.servidas));
  return (
    <View style={s.reportCard}>
      <Text style={s.sectionTitle}>{t('rel.merenda')}</Text>
      <View style={s.metricsRow}>
        <View style={s.metricItem}>
          <Text style={[s.metricValue, { color: colors.warning[600] }]}>{total.toLocaleString('pt-BR')}</Text>
          <Text style={s.metricLabel}>{t(meta.totalLabel)}</Text>
        </View>
        <View style={s.metricDivider} />
        <View style={s.metricItem}>
          <Text style={[s.metricValue, { color: colors.gray[700] }]}>
            {Math.round(total / dias.length).toLocaleString('pt-BR')}
          </Text>
          <Text style={s.metricLabel}>{t(meta.mediaLabel)}</Text>
        </View>
      </View>
      <View style={s.divider} />
      {dias.map((d) => (
        <View key={d.label} style={s.merendaRow}>
          <Text style={s.merendaDia}>{d.label}</Text>
          <View style={s.merendaBarWrap}>
            <View style={[s.merendaBar, { width: `${(d.servidas / maxVal) * 100}%` as any }]} />
          </View>
          <Text style={s.merendaQtd}>{d.servidas.toLocaleString('pt-BR')}</Text>
        </View>
      ))}
    </View>
  );
}

function DesempenhoCard({ period }: { period: Period }) {
  const t          = useT();
  const turmas     = DESEMPENHO[period];
  const mediaGeral = (turmas.reduce((a, turma) => a + turma.media, 0) / turmas.length).toFixed(1);
  return (
    <View style={s.reportCard}>
      <Text style={s.sectionTitle}>{t('rel.performance')}</Text>
      <View style={s.metricsRow}>
        <View style={s.metricItem}>
          <Text style={[s.metricValue, { color: colors.blue[600] }]}>{mediaGeral}</Text>
          <Text style={s.metricLabel}>{t('rel.avgGrade')}</Text>
        </View>
        <View style={s.metricDivider} />
        <View style={s.metricItem}>
          <Text style={[s.metricValue, { color: colors.success[600] }]}>{turmas.filter(turma => turma.media >= 7).length}</Text>
          <Text style={s.metricLabel}>{t('rel.above7')}</Text>
        </View>
        <View style={s.metricDivider} />
        <View style={s.metricItem}>
          <Text style={[s.metricValue, { color: colors.error[500] }]}>{turmas.filter(turma => turma.media < 7).length}</Text>
          <Text style={s.metricLabel}>{t('rel.below7')}</Text>
        </View>
      </View>
      <View style={s.divider} />
      {turmas.map((turma) => {
        const barColor = turma.media >= 8 ? colors.success[500] : turma.media >= 7 ? colors.blue[400] : colors.error[400];
        return (
          <View key={turma.turma} style={s.perfRow}>
            <Text style={s.perfTurma}>{turma.turma}</Text>
            <View style={s.perfBarWrap}>
              <View style={[s.perfBar, { width: `${(turma.media / 10) * 100}%` as any, backgroundColor: barColor }]} />
            </View>
            <Text style={[s.perfMedia, { color: barColor }]}>{turma.media.toFixed(1)}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────

export default function RelatoriosScreen() {
  const [period, setPeriod] = useState<Period>('mensal');
  return (
    <View style={s.container}>
      <View style={s.body}>
        <PeriodTabs value={period} onChange={setPeriod} />
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <EvasaoCard    period={period} />
          <MerendaCard   period={period} />
          <DesempenhoCard period={period} />
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

  scroll: { paddingHorizontal: 16, paddingBottom: 32, gap: 16 },

  reportCard:  { backgroundColor: colors.base.white, borderRadius: 20, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.gray[300] },
  sectionTitle:{ fontSize: 16, fontWeight: '700', color: colors.gray[900] },

  metricsRow:    { flexDirection: 'row' },
  metricItem:    { flex: 1, alignItems: 'center', gap: 2 },
  metricDivider: { width: 1, backgroundColor: colors.gray[100] },
  metricValue:   { fontSize: 22, fontWeight: '800' },
  metricLabel:   { fontSize: 11, color: colors.gray[400], textAlign: 'center' },

  divider: { height: 1, backgroundColor: colors.gray[100] },

  listRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listAvatar:   { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.error[100], alignItems: 'center', justifyContent: 'center' },
  listInitials: { fontSize: 13, fontWeight: '700', color: colors.error[600] },
  listInfo:     { flex: 1, gap: 1 },
  listName:     { fontSize: 14, fontWeight: '600', color: colors.gray[900] },
  listSub:      { fontSize: 12, color: colors.gray[500] },
  riskBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  riskText:     { fontSize: 13, fontWeight: '700' },

  merendaRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  merendaDia:    { fontSize: 13, color: colors.gray[600], width: 110 },
  merendaBarWrap:{ flex: 1, height: 8, backgroundColor: colors.gray[100], borderRadius: 4, overflow: 'hidden' },
  merendaBar:    { height: 8, borderRadius: 4, backgroundColor: colors.warning[400] },
  merendaQtd:    { fontSize: 13, fontWeight: '700', color: colors.gray[800], width: 32, textAlign: 'right' },

  perfRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  perfTurma:   { fontSize: 12, color: colors.gray[600], width: 88 },
  perfBarWrap: { flex: 1, height: 6, backgroundColor: colors.gray[100], borderRadius: 3, overflow: 'hidden' },
  perfBar:     { height: 6, borderRadius: 3 },
  perfMedia:   { fontSize: 13, fontWeight: '700', width: 32, textAlign: 'right' },
});
