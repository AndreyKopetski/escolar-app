import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

// ─── Mock data ────────────────────────────────────────────

const DOCENTES = [
  { nome: 'Ana Souza',       disciplina: 'Educação Infantil', turma: 'Pré I – A',  diarioOk: true,  notasOk: true,  alerta: null },
  { nome: 'Carlos Lima',     disciplina: 'Educação Infantil', turma: 'Pré I – B',  diarioOk: true,  notasOk: false, alerta: 'Notas pendentes' },
  { nome: 'Marta Oliveira',  disciplina: 'Educação Infantil', turma: 'Pré II – A', diarioOk: false, notasOk: false, alerta: 'Faltou hoje' },
  { nome: 'João Pereira',    disciplina: 'Matemática',        turma: '1º Ano – A', diarioOk: true,  notasOk: true,  alerta: null },
  { nome: 'Fernanda Costa',  disciplina: 'Português',         turma: '1º Ano – B', diarioOk: true,  notasOk: false, alerta: 'Notas pendentes' },
  { nome: 'Paulo Mendes',    disciplina: 'Ciências',          turma: '2º Ano – A', diarioOk: false, notasOk: true,  alerta: 'Diário em atraso' },
  { nome: 'Ricardo Alves',   disciplina: 'Geografia',         turma: '3º Ano – A', diarioOk: true,  notasOk: true,  alerta: null },
  { nome: 'Beatriz Nunes',   disciplina: 'Artes',             turma: '4º Ano – A', diarioOk: false, notasOk: false, alerta: 'Faltou hoje' },
];

const ACOMP = [
  { nome: 'Ana Souza',      score: 92, obs: 'Excelente engajamento com os alunos.' },
  { nome: 'João Pereira',   score: 88, obs: 'Boa progressão na turma.' },
  { nome: 'Fernanda Costa', score: 81, obs: 'Notas pendentes desde bimestre anterior.' },
  { nome: 'Ricardo Alves',  score: 85, obs: 'Planejamento pedagógico atualizado.' },
  { nome: 'Paulo Mendes',   score: 72, obs: 'Diário de classe desatualizado.' },
];

// ─── Tab bar (estilo BimestreTabs) ────────────────────────

type Tab = 'docentes' | 'diario' | 'acomp';

function TabBar({ value, onChange }: { value: Tab; onChange: (tab: Tab) => void }) {
  const t = useT();
  const tabs: { key: Tab; label: string }[] = [
    { key: 'docentes', label: t('mais.docentes') },
    { key: 'diario',   label: t('mais.diario') },
    { key: 'acomp',    label: t('mais.pedagogico') },
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

// ─── Components ───────────────────────────────────────────

function StatusChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={[s.chip, { backgroundColor: ok ? colors.success[50] : colors.error[50] }]}>
      <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
        {ok
          ? <Path d="M5 13l4 4L19 7" stroke={colors.success[600]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          : <Path d="M18 6L6 18M6 6l12 12" stroke={colors.error[500]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        }
      </Svg>
      <Text style={[s.chipText, { color: ok ? colors.success[700] : colors.error[600] }]}>{label}</Text>
    </View>
  );
}

function DocenteCard({ doc }: { doc: typeof DOCENTES[0] }) {
  return (
    <View style={s.card}>
      <View style={s.docRow}>
        <View style={s.docAvatar}>
          <Text style={s.docInitials}>{doc.nome.split(' ').map(w => w[0]).slice(0, 2).join('')}</Text>
        </View>
        <View style={s.docInfo}>
          <Text style={s.docName}>{doc.nome}</Text>
          <Text style={s.docSub}>{doc.disciplina} · {doc.turma}</Text>
        </View>
      </View>
      <AlertChipRow doc={doc} />
    </View>
  );
}

function AlertChipRow({ doc }: { doc: typeof DOCENTES[0] }) {
  const t = useT();
  const alertLabel = doc.alerta === 'Faltou hoje' ? t('mais.faultToday')
    : doc.alerta === 'Diário em atraso' ? t('mais.diaryDelay')
    : doc.alerta === 'Notas pendentes' ? t('mais.notesPending')
    : doc.alerta;
  return (
    <View style={s.chipRow}>
      <StatusChip ok={doc.diarioOk} label={t('mais.diary')} />
      <StatusChip ok={doc.notasOk}  label={t('mais.notes')} />
      {doc.alerta && (
        <View style={s.alertChip}>
          <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
            <Path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke={colors.warning[700]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={s.alertChipText}>{alertLabel}</Text>
        </View>
      )}
    </View>
  );
}

function DiarioView() {
  const t         = useT();
  const diarioPct = Math.round((DOCENTES.filter(d => d.diarioOk).length / DOCENTES.length) * 100);
  const notasPct  = Math.round((DOCENTES.filter(d => d.notasOk).length  / DOCENTES.length) * 100);
  const pendentes = DOCENTES.filter(d => !d.diarioOk || !d.notasOk);
  return (
    <>
      {[
        { title: t('mais.diaryClass'),   pct: diarioPct, count: DOCENTES.filter(d => d.diarioOk).length, color: colors.blue[500], iconBg: colors.blue[100] },
        { title: t('mais.launchNotes'),  pct: notasPct,  count: DOCENTES.filter(d => d.notasOk).length,  color: colors.violet[500], iconBg: colors.violet[100] },
      ].map((item) => (
        <View key={item.title} style={s.infoCard}>
          <View style={s.infoRow}>
            <View style={[s.infoIconBox, { backgroundColor: item.iconBg }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M9 12h6M9 16h4M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-5zM14 3v5h5"
                  stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={s.infoText}>
              <Text style={s.infoTitle}>{item.title}</Text>
              <Text style={s.infoSub}>{t('mais.teacherCount', { n: item.count, total: DOCENTES.length })}</Text>
            </View>
            <Text style={[s.infoValue, { color: item.color }]}>{item.pct}%</Text>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${item.pct}%` as any, backgroundColor: item.color }]} />
          </View>
        </View>
      ))}
      <Text style={s.subhead}>{t('mais.pendencies')}</Text>
      {pendentes.map((d) => (
        <View key={d.nome} style={s.card}>
          <View style={s.docRow}>
            <View style={s.docAvatar}>
              <Text style={s.docInitials}>{d.nome.split(' ').map(w => w[0]).slice(0, 2).join('')}</Text>
            </View>
            <View style={s.docInfo}>
              <Text style={s.docName}>{d.nome}</Text>
              <Text style={s.docSub}>{d.turma}</Text>
            </View>
          </View>
          <View style={s.chipRow}>
            {!d.diarioOk && <StatusChip ok={false} label={t('mais.diary')} />}
            {!d.notasOk  && <StatusChip ok={false} label={t('mais.notes')} />}
          </View>
        </View>
      ))}
    </>
  );
}

function AcompView() {
  const t = useT();
  return (
    <>
      <View style={s.acompBanner}>
        <Text style={s.acompBannerText}>
          {t('mais.score')}
        </Text>
      </View>
      {ACOMP.map((a) => {
        const barColor = a.score >= 88 ? colors.success[500] : a.score >= 75 ? colors.brand[500] : colors.warning[500];
        return (
          <View key={a.nome} style={s.card}>
            <View style={s.docRow}>
              <View style={s.docAvatar}>
                <Text style={s.docInitials}>{a.nome.split(' ').map(w => w[0]).slice(0, 2).join('')}</Text>
              </View>
              <View style={s.docInfo}>
                <Text style={s.docName}>{a.nome}</Text>
                <Text style={s.docSub} numberOfLines={2}>{a.obs}</Text>
              </View>
              <Text style={[s.acompScore, { color: barColor }]}>{a.score}</Text>
            </View>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${a.score}%` as any, backgroundColor: barColor }]} />
            </View>
          </View>
        );
      })}
    </>
  );
}

// ─── Tela ─────────────────────────────────────────────────

export default function MaisScreen() {
  const t          = useT();
  const [tab, setTab] = useState<Tab>('docentes');
  const alertCount = DOCENTES.filter(d => d.alerta).length;
  return (
    <View style={s.container}>
      <View style={s.body}>
        <View style={s.pageHeader}>
          <Text style={s.pageTitle}>{t('mais.docentes')}</Text>
          {alertCount > 0 && (
            <View style={s.alertBadge}>
              <Text style={s.alertBadgeText}>{t('mais.pendingCount', { n: alertCount })}</Text>
            </View>
          )}
        </View>
        <TabBar value={tab} onChange={setTab} />
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'docentes' && DOCENTES.map((d) => <DocenteCard key={d.nome} doc={d} />)}
          {tab === 'diario'   && <DiarioView />}
          {tab === 'acomp'    && <AcompView />}
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[100] },
  body:      { flex: 1, backgroundColor: colors.base.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },

  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  pageTitle:  { fontSize: 22, fontWeight: '800', color: colors.gray[900] },
  alertBadge: { backgroundColor: colors.warning[100], borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  alertBadgeText: { fontSize: 12, fontWeight: '600', color: colors.warning[700] },

  tabRow:        { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 16 },
  tab:           { flex: 1, height: 32, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.gray[100] },
  tabActive:     { backgroundColor: colors.success[100] },
  tabText:       { fontSize: 13, fontWeight: '600', color: colors.gray[500] },
  tabTextActive: { color: colors.brand[700] },

  scroll: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },

  card:        { backgroundColor: colors.base.white, borderRadius: 16, padding: 14, gap: 10, borderWidth: 1, borderColor: colors.gray[300] },
  docRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  docAvatar:   { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brand[100], alignItems: 'center', justifyContent: 'center' },
  docInitials: { fontSize: 15, fontWeight: '700', color: colors.brand[700] },
  docInfo:     { flex: 1, gap: 2 },
  docName:     { fontSize: 14, fontWeight: '600', color: colors.gray[900] },
  docSub:      { fontSize: 12, color: colors.gray[500] },

  chipRow:       { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  chipText:      { fontSize: 12, fontWeight: '600' },
  alertChip:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, backgroundColor: colors.warning[50] },
  alertChipText: { fontSize: 12, fontWeight: '600', color: colors.warning[700] },

  infoCard:    { backgroundColor: colors.base.white, borderRadius: 16, padding: 14, gap: 10, borderWidth: 1, borderColor: colors.gray[300] },
  infoRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  infoText:    { flex: 1, gap: 2 },
  infoTitle:   { fontSize: 14, fontWeight: '600', color: colors.gray[900] },
  infoSub:     { fontSize: 12, color: colors.gray[500] },
  infoValue:   { fontSize: 22, fontWeight: '800' },
  progressTrack: { height: 6, backgroundColor: colors.gray[100], borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: 6, borderRadius: 3 },

  subhead:       { fontSize: 15, fontWeight: '700', color: colors.gray[700], marginTop: 4 },

  acompBanner:     { backgroundColor: colors.blue[50], borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.blue[100] },
  acompBannerText: { fontSize: 13, color: colors.blue[700], lineHeight: 20 },
  acompScore:      { fontSize: 26, fontWeight: '900', width: 40, textAlign: 'right' },
});
