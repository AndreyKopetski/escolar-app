import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

// ─── Mock data ────────────────────────────────────────────

const ALERGIAS = [
  { nome: 'Lucas Ferreira',   turma: '4º Ano – A', restricao: 'Alergia a amendoim',          refeicao: 'Cardápio sem oleaginosas' },
  { nome: 'Sofia Almeida',    turma: 'Pré I – A',  restricao: 'Intolerância à lactose',       refeicao: 'Substituir leite por bebida vegetal' },
  { nome: 'Beatriz Pinto',    turma: 'Pré I – A',  restricao: 'Alergia a glúten (Celíaca)',   refeicao: 'Pão e bolo sem glúten' },
  { nome: 'Gustavo Prado',    turma: '4º Ano – A', restricao: 'Alergia a frutos do mar',      refeicao: 'Cardápio sem peixes e frutos do mar' },
  { nome: 'Helena Nogueira',  turma: '4º Ano – A', restricao: 'Alergia a ovo',               refeicao: 'Substituições sem ovo em preparações' },
];

const DIETAS = [
  { nome: 'Camila Freitas',  turma: 'Pré I – A',  restricao: 'Vegetariana',           refeicao: 'Proteína vegetal (leguminosa)' },
  { nome: 'Thomas Kopetski', turma: 'Pré I – A',  restricao: 'Vegana',                refeicao: 'Sem nenhum produto animal' },
  { nome: 'Igor Andrade',    turma: '4º Ano – A', restricao: 'Halal',                 refeicao: 'Carnes certificadas halal' },
  { nome: 'Renata Moura',    turma: '4º Ano – A', restricao: 'Sem carne vermelha',    refeicao: 'Frango ou peixe como proteína' },
];

const MEDICAS = [
  { nome: 'Isabela Santos',  turma: '2º Ano – B', restricao: 'Diabetes tipo 1',       refeicao: 'Baixo índice glicêmico, sem açúcar' },
  { nome: 'Pedro Almeida',   turma: '5º Ano – A', restricao: 'Hipertensão',           refeicao: 'Dieta hipossódica (sem sal extra)' },
  { nome: 'Mariana Ferreira',turma: '1º Ano – A', restricao: 'Fenilcetonúria',        refeicao: 'Dieta especial low-PHE' },
  { nome: 'Gabriel Barbosa', turma: 'Pré I – A',  restricao: 'Refluxo gastroesofágico',refeicao: 'Evitar frituras e ácidos' },
];

// ─── Components ───────────────────────────────────────────

type Tab = 'alergias' | 'dietas' | 'medicas';

function TabBar({ value, onChange }: { value: Tab; onChange: (tab: Tab) => void }) {
  const t = useT();
  const tabs: { key: Tab; label: string }[] = [
    { key: 'alergias', label: t('restric.allergies') },
    { key: 'dietas',   label: t('restric.diets') },
    { key: 'medicas',  label: t('restric.medical') },
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

const BADGE_CFG = {
  alergias: { bg: colors.error[50],   border: colors.error[200],   text: colors.error[700],   dot: colors.error[500] },
  dietas:   { bg: colors.success[50], border: colors.success[200], text: colors.success[700], dot: colors.success[500] },
  medicas:  { bg: colors.blue[50],    border: colors.blue[200],    text: colors.blue[700],    dot: colors.blue[500] },
};

function RestricaoCard({ aluno, tab }: { aluno: typeof ALERGIAS[0]; tab: Tab }) {
  const cfg = BADGE_CFG[tab];
  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={s.avatarCircle}>
          <Text style={s.avatarText}>{aluno.nome.split(' ').map(w => w[0]).slice(0, 2).join('')}</Text>
        </View>
        <View style={s.cardInfo}>
          <Text style={s.cardName}>{aluno.nome}</Text>
          <Text style={s.cardTurma}>{aluno.turma}</Text>
        </View>
      </View>
      <View style={[s.restricaoBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
        <View style={[s.restricaoDot, { backgroundColor: cfg.dot }]} />
        <Text style={[s.restricaoText, { color: cfg.text }]}>{aluno.restricao}</Text>
      </View>
      <View style={s.refeicaoBox}>
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"
            stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={s.refeicaoText}>{aluno.refeicao}</Text>
      </View>
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────

export default function RestricoesScreen() {
  const t    = useT();
  const [tab, setTab] = useState<Tab>('alergias');

  const data = tab === 'alergias' ? ALERGIAS : tab === 'dietas' ? DIETAS : MEDICAS;

  return (
    <View style={s.container}>
      <View style={s.body}>

        {/* Banner de refeições especiais */}
        <View style={s.topBanner}>
          <View style={s.bannerStats}>
            <View style={s.bannerStat}>
              <Text style={[s.bannerValue, { color: colors.error[600] }]}>{ALERGIAS.length}</Text>
              <Text style={s.bannerLabel}>{t('restric.allergies')}</Text>
            </View>
            <View style={s.bannerDivider} />
            <View style={s.bannerStat}>
              <Text style={[s.bannerValue, { color: colors.success[600] }]}>{DIETAS.length}</Text>
              <Text style={s.bannerLabel}>{t('restric.diets')}</Text>
            </View>
            <View style={s.bannerDivider} />
            <View style={s.bannerStat}>
              <Text style={[s.bannerValue, { color: colors.blue[600] }]}>{MEDICAS.length}</Text>
              <Text style={s.bannerLabel}>{t('restric.medical')}</Text>
            </View>
          </View>
        </View>

        <TabBar value={tab} onChange={setTab} />

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          <View style={s.sectionNote}>
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
              <Path d="M12 22C17.523 22 22 17.523 22 12S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM11 12h1v4h1M12 8h.01"
                stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={s.sectionNoteText}>
              {tab === 'alergias' && t('restric.allergiesCount', { n: ALERGIAS.length })}
              {tab === 'dietas'   && t('restric.dietsCount',     { n: DIETAS.length })}
              {tab === 'medicas'  && t('restric.medicalCount',   { n: MEDICAS.length })}
            </Text>
          </View>

          {data.map((a) => <RestricaoCard key={a.nome} aluno={a} tab={tab} />)}

        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[100] },
  body:      { flex: 1, backgroundColor: colors.base.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },

  topBanner:    { borderBottomWidth: 1, borderBottomColor: colors.gray[100], paddingVertical: 12, paddingHorizontal: 16 },
  bannerStats:  { flexDirection: 'row' },
  bannerStat:   { flex: 1, alignItems: 'center', gap: 2 },
  bannerDivider:{ width: 1, backgroundColor: colors.gray[200] },
  bannerValue:  { fontSize: 22, fontWeight: '800' },
  bannerLabel:  { fontSize: 11, color: colors.gray[500] },

  tabRow:        { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  tab:           { flex: 1, height: 32, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.gray[100] },
  tabActive:     { backgroundColor: colors.success[100] },
  tabText:       { fontSize: 13, fontWeight: '600', color: colors.gray[500] },
  tabTextActive: { color: colors.brand[700] },

  scroll: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },

  sectionNote:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.gray[50], borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.gray[200] },
  sectionNoteText: { fontSize: 12, color: colors.gray[500], flex: 1, lineHeight: 18 },

  card:       { backgroundColor: colors.base.white, borderRadius: 16, padding: 14, gap: 10, borderWidth: 1, borderColor: colors.gray[200] },
  cardTop:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle:{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700', color: colors.gray[600] },
  cardInfo:   { flex: 1, gap: 2 },
  cardName:   { fontSize: 15, fontWeight: '600', color: colors.gray[900] },
  cardTurma:  { fontSize: 12, color: colors.gray[500] },

  restricaoBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  restricaoDot:   { width: 8, height: 8, borderRadius: 4 },
  restricaoText:  { fontSize: 13, fontWeight: '600', flex: 1 },

  refeicaoBox:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.gray[50], borderRadius: 8, padding: 10 },
  refeicaoText: { fontSize: 13, color: colors.gray[600], flex: 1, lineHeight: 18 },
});
