import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

// ─── Mock data ────────────────────────────────────────────

const TOTAL_PREVISTOS = 273;
const TOTAL_PRESENTES = 245;

const POR_TURMA = [
  { turma: 'Pré I – A',   previstos: 22, presentes: 20 },
  { turma: 'Pré I – B',   previstos: 21, presentes: 18 },
  { turma: 'Pré II – A',  previstos: 24, presentes: 23 },
  { turma: '1º Ano – A',  previstos: 28, presentes: 25 },
  { turma: '1º Ano – B',  previstos: 27, presentes: 24 },
  { turma: '2º Ano – A',  previstos: 26, presentes: 22 },
  { turma: '2º Ano – B',  previstos: 25, presentes: 21 },
  { turma: '3º Ano – A',  previstos: 29, presentes: 27 },
  { turma: '4º Ano – A',  previstos: 28, presentes: 20 },
  { turma: '5º Ano – A',  previstos: 30, presentes: 29 },
];

const FAIXAS = [
  { label: '4–5 anos',   turmas: 'Pré I e Pré II',  alunos: 67, presentes: 61, cor: colors.violet[400] },
  { label: '6–7 anos',   turmas: '1º e 2º anos',    alunos: 106, presentes: 90, cor: colors.blue[400] },
  { label: '8–9 anos',   turmas: '3º e 4º anos',    alunos: 57, presentes: 47, cor: colors.warning[400] },
  { label: '10–11 anos', turmas: '5º ano',           alunos: 30, presentes: 29, cor: colors.success[500] },
];

const HISTORICO = [
  { dia: 'Seg', media: 241 },
  { dia: 'Ter', media: 238 },
  { dia: 'Qua', media: 245 },
  { dia: 'Qui', media: 230 },
  { dia: 'Sex', media: 235 },
];

const ESTIMATIVA = Math.round(TOTAL_PRESENTES * 1.03); // 3% extra de segurança

const RESTRICOES = { alergias: 5, dietas: 4, medicas: 4 };

// ─── Components ───────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

function StatCard({ value, label, sub, color, icon }: {
  value: string; label: string; sub?: string; color: string; icon: React.ReactNode;
}) {
  return (
    <View style={s.statCard}>
      <View style={[s.statIcon, { backgroundColor: color + '22' }]}>{icon}</View>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
      {sub && <Text style={s.statSub}>{sub}</Text>}
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────

export default function EquipeInicioScreen() {
  const t       = useT();
  const pct     = Math.round((TOTAL_PRESENTES / TOTAL_PREVISTOS) * 100);
  const barMax  = Math.max(...HISTORICO.map(d => d.media));

  return (
    <View style={s.container}>
      <View style={s.body}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Estimativa de refeições — info principal ── */}
          <View style={s.estimativaCard}>
            <View style={s.estimativaLeft}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"
                  stroke={colors.warning[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <View>
                <Text style={s.estimativaLabel}>{t('equipeInicio.mealsToday')}</Text>
                <Text style={s.estimativaSub}>{t('equipeInicio.safetyMargin')}</Text>
              </View>
            </View>
            <Text style={s.estimativaValue}>{ESTIMATIVA}</Text>
          </View>

          {/* ── Restrições alimentares (quantitativos) ── */}
          <View style={s.restricoesCard}>
            <View style={s.restricoesHeader}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"
                  stroke={colors.warning[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={s.restricoesTitle}>{t('equipeInicio.restrictions')}</Text>
            </View>
            <View style={s.restricoesRow}>
              {[
                { v: RESTRICOES.alergias, l: t('equipeInicio.allergies'), c: colors.error[500],   bg: colors.error[50] },
                { v: RESTRICOES.dietas,   l: t('equipeInicio.diets'),     c: colors.success[600], bg: colors.success[50] },
                { v: RESTRICOES.medicas,  l: t('equipeInicio.medical'),   c: colors.blue[600],    bg: colors.blue[50] },
              ].map((item, i, arr) => (
                <View key={item.l} style={{ flexDirection: 'row', flex: 1 }}>
                  <View style={[s.restricoesItem, { backgroundColor: item.bg }]}>
                    <Text style={[s.restricoesValue, { color: item.c }]}>{item.v}</Text>
                    <Text style={s.restricoesLabel}>{item.l}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={s.restricoesDivider} />}
                </View>
              ))}
            </View>
          </View>

          {/* ── Resumo do dia ── */}
          <SectionTitle>{t('equipeInicio.dayResume')}</SectionTitle>
          <View style={s.row}>
            <StatCard
              value={String(TOTAL_PREVISTOS)} label={t('equipeInicio.foreseen')}
              sub={t('equipeInicio.foreseenSub')} color={colors.blue[500]}
              icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={colors.blue[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Circle cx="9" cy="7" r="4" stroke={colors.blue[500]} strokeWidth="2" />
                <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={colors.blue[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>}
            />
            <StatCard
              value={String(TOTAL_PRESENTES)} label={t('equipeInicio.presentNow')}
              sub={`${pct}% ${t('freq.percentPresenca').replace('% ', '')}`} color={colors.success[600]}
              icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke={colors.success[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Circle cx="9" cy="7" r="4" stroke={colors.success[600]} strokeWidth="2" />
                <Path d="M17 11l2 2 4-4" stroke={colors.success[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>}
            />
          </View>

          {/* ── Presença por turma ── */}
          <SectionTitle>{t('equipeInicio.byClass')}</SectionTitle>
          <View style={s.card}>
            {POR_TURMA.map((t, i) => {
              const p = Math.round((t.presentes / t.previstos) * 100);
              const bc = p >= 90 ? colors.success[500] : p >= 75 ? colors.warning[400] : colors.error[400];
              return (
                <View key={t.turma}>
                  <View style={s.turmaRow}>
                    <Text style={s.turmaName}>{t.turma}</Text>
                    <View style={s.turmaRight}>
                      <Text style={s.turmaCount}>{t.presentes}<Text style={s.turmaSub}>/{t.previstos}</Text></Text>
                      <View style={s.turmaMiniBar}>
                        <View style={[s.turmaMiniBarFill, { width: `${p}%` as any, backgroundColor: bc }]} />
                      </View>
                    </View>
                  </View>
                  {i < POR_TURMA.length - 1 && <View style={s.divider} />}
                </View>
              );
            })}
          </View>

          {/* ── Por faixa etária ── */}
          <SectionTitle>{t('equipeInicio.byAge')}</SectionTitle>
          <View style={s.card}>
            {FAIXAS.map((f, i) => (
              <View key={f.label}>
                <View style={s.faixaRow}>
                  <View style={[s.faixaDot, { backgroundColor: f.cor }]} />
                  <View style={s.faixaInfo}>
                    <Text style={s.faixaLabel}>{f.label}</Text>
                    <Text style={s.faixaSub}>{f.turmas}</Text>
                  </View>
                  <View style={s.faixaRight}>
                    <Text style={s.faixaPresentes}>{f.presentes}</Text>
                    <Text style={s.faixaTotal}>{t('equipeInicio.of', { total: f.alunos })}</Text>
                  </View>
                </View>
                {i < FAIXAS.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </View>

          {/* ── Histórico de consumo ── */}
          <SectionTitle>{t('equipeInicio.history')}</SectionTitle>
          <View style={s.card}>
            <View style={s.barChart}>
              {HISTORICO.map((d) => {
                const h = Math.round((d.media / barMax) * 80);
                return (
                  <View key={d.dia} style={s.barGroup}>
                    <Text style={s.barValue}>{d.media}</Text>
                    <View style={s.barTrack}>
                      <View style={[s.barFill, { height: h }]} />
                    </View>
                    <Text style={s.barLabel}>{d.dia}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={s.chartNote}>{t('equipeInicio.historyNote')}</Text>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[100] },
  body:      { flex: 1, backgroundColor: colors.base.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  scroll:    { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 12 },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.gray[700], marginTop: 4 },

  row:      { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: colors.base.white, borderRadius: 16, padding: 16, gap: 6, borderWidth: 1, borderColor: colors.gray[200], alignItems: 'center' },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statValue:{ fontSize: 28, fontWeight: '800' },
  statLabel:{ fontSize: 13, fontWeight: '600', color: colors.gray[700], textAlign: 'center' },
  statSub:  { fontSize: 11, color: colors.gray[400], textAlign: 'center' },

  card:    { backgroundColor: colors.base.white, borderRadius: 16, paddingVertical: 4, borderWidth: 1, borderColor: colors.gray[200] },
  divider: { height: 1, backgroundColor: colors.gray[100], marginHorizontal: 14 },

  turmaRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 11 },
  turmaName:      { fontSize: 13, fontWeight: '500', color: colors.gray[700], flex: 1 },
  turmaRight:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  turmaCount:     { fontSize: 15, fontWeight: '700', color: colors.gray[900] },
  turmaSub:       { fontSize: 12, fontWeight: '400', color: colors.gray[400] },
  turmaMiniBar:   { width: 60, height: 6, backgroundColor: colors.gray[100], borderRadius: 3, overflow: 'hidden' },
  turmaMiniBarFill:{ height: 6, borderRadius: 3 },

  faixaRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  faixaDot:      { width: 12, height: 12, borderRadius: 6 },
  faixaInfo:     { flex: 1, gap: 2 },
  faixaLabel:    { fontSize: 14, fontWeight: '600', color: colors.gray[900] },
  faixaSub:      { fontSize: 12, color: colors.gray[400] },
  faixaRight:    { alignItems: 'flex-end', gap: 1 },
  faixaPresentes:{ fontSize: 18, fontWeight: '800', color: colors.gray[900] },
  faixaTotal:    { fontSize: 11, color: colors.gray[400] },

  barChart:    { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 110, paddingHorizontal: 12, paddingTop: 12 },
  barGroup:    { alignItems: 'center', gap: 4, flex: 1 },
  barValue:    { fontSize: 11, fontWeight: '600', color: colors.gray[600] },
  barTrack:    { width: 32, height: 80, backgroundColor: colors.gray[100], borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill:     { width: 32, backgroundColor: colors.warning[400], borderRadius: 6 },
  barLabel:    { fontSize: 11, color: colors.gray[500] },
  chartNote:   { fontSize: 11, color: colors.gray[400], textAlign: 'center', paddingBottom: 12, paddingTop: 4 },

  restricoesCard:   { backgroundColor: colors.base.white, borderRadius: 16, borderWidth: 1, borderColor: colors.gray[200], overflow: 'hidden' },
  restricoesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  restricoesTitle:  { fontSize: 14, fontWeight: '700', color: colors.gray[800] },
  restricoesRow:    { flexDirection: 'row' },
  restricoesItem:   { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 2 },
  restricoesDivider:{ width: 1, backgroundColor: colors.gray[100] },
  restricoesValue:  { fontSize: 22, fontWeight: '800' },
  restricoesLabel:  { fontSize: 11, color: colors.gray[500] },

  estimativaCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.warning[50], borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.warning[200],
  },
  estimativaLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  estimativaLabel: { fontSize: 14, fontWeight: '700', color: colors.warning[800] },
  estimativaSub:   { fontSize: 11, color: colors.warning[600], marginTop: 2 },
  estimativaValue: { fontSize: 36, fontWeight: '900', color: colors.warning[700] },
});
