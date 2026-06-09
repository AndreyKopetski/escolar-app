import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

// ─── Mock data ────────────────────────────────────────────

type EventType = 'reuniao' | 'avaliacao' | 'formacao' | 'evento';

interface Evento {
  id: string;
  tipo: EventType;
  titulo: string;
  descricao: string;
  data: string;
  hora?: string;
  turma?: string;
}

const EVENTOS: Evento[] = [
  { id: '1',  tipo: 'reuniao',   titulo: 'Conselho de Classe',       descricao: 'Avaliação bimestral — 1º e 2º ano',        data: '03/06', hora: '14:00' },
  { id: '2',  tipo: 'formacao',  titulo: 'Formação Docente',         descricao: 'Metodologias ativas – Prof.ª Elaine Costa',  data: '06/06', hora: '08:00' },
  { id: '3',  tipo: 'avaliacao', titulo: 'Simulado Municipal',       descricao: '4º e 5º anos — Língua Portuguesa e Mat.',   data: '10/06', hora: '07:30', turma: '4º e 5º' },
  { id: '4',  tipo: 'evento',    titulo: 'Dia dos Namorados',        descricao: 'Atividade cultural na escola',               data: '12/06' },
  { id: '5',  tipo: 'reuniao',   titulo: 'Reunião de Pais',          descricao: 'Entrega de boletins e orientações',          data: '14/06', hora: '09:00' },
  { id: '6',  tipo: 'avaliacao', titulo: 'Avaliação Diagnóstica',    descricao: 'Todas as turmas — Matemática',               data: '18/06', hora: '07:30' },
  { id: '7',  tipo: 'formacao',  titulo: 'HTPC',                     descricao: 'Planejamento pedagógico coletivo',           data: '20/06', hora: '13:00' },
  { id: '8',  tipo: 'evento',    titulo: 'Festa Junina',             descricao: 'Evento aberto à comunidade escolar',         data: '24/06', hora: '15:00' },
  { id: '9',  tipo: 'reuniao',   titulo: 'Reunião com Secretaria',   descricao: 'Prestação de contas mensal',                 data: '27/06', hora: '10:00' },
  { id: '10', tipo: 'formacao',  titulo: 'Semana Pedagógica',        descricao: 'Planejamento do 2º semestre',                data: '30/06', hora: '08:00' },
];

const TYPE_CONFIG: Record<EventType, { labelKey: string; bg: string; color: string; dotColor: string }> = {
  reuniao:   { labelKey: 'agenda.meetingLabel',    bg: colors.blue[50],    color: colors.blue[700],    dotColor: colors.blue[500] },
  avaliacao: { labelKey: 'agenda.assessmentLabel', bg: colors.violet[50],  color: colors.violet[700],  dotColor: colors.violet[500] },
  formacao:  { labelKey: 'agenda.trainingLabel',   bg: colors.success[50], color: colors.success[700], dotColor: colors.success[500] },
  evento:    { labelKey: 'agenda.eventLabel',      bg: colors.warning[50], color: colors.warning[700], dotColor: colors.warning[500] },
};

// ─── Tab bar (estilo BimestreTabs) ────────────────────────

type FilterType = 'todos' | EventType;

function TabBar({ value, onChange }: { value: FilterType; onChange: (f: FilterType) => void }) {
  const t = useT();
  const tabs: { key: FilterType; label: string }[] = [
    { key: 'todos',     label: t('agenda.all') },
    { key: 'reuniao',   label: t('agenda.meetings') },
    { key: 'avaliacao', label: t('agenda.assessments') },
    { key: 'formacao',  label: t('agenda.training') },
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

// ─── Event card ───────────────────────────────────────────

function EventoCard({ evento }: { evento: Evento }) {
  const t   = useT();
  const cfg = TYPE_CONFIG[evento.tipo];
  return (
    <View style={s.card}>
      <View style={s.cardLeft}>
        <View style={[s.dateBubble, { backgroundColor: cfg.bg }]}>
          <Text style={[s.dateDay,   { color: cfg.color }]}>{evento.data.split('/')[0]}</Text>
          <Text style={[s.dateMonth, { color: cfg.color }]}>/{evento.data.split('/')[1]}</Text>
        </View>
        <View style={[s.connector, { backgroundColor: cfg.dotColor }]} />
      </View>
      <View style={s.cardBody}>
        <View style={s.cardTop}>
          <Text style={s.cardTitle}>{evento.titulo}</Text>
          <View style={[s.typeBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[s.typeBadgeText, { color: cfg.color }]}>{t(cfg.labelKey)}</Text>
          </View>
        </View>
        <Text style={s.cardDesc}>{evento.descricao}</Text>
        {(evento.hora || evento.turma) && (
          <View style={s.cardMeta}>
            {evento.hora && (
              <View style={s.metaItem}>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="9" stroke={colors.gray[400]} strokeWidth="2" />
                  <Path d="M12 7v5l3 3" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" />
                </Svg>
                <Text style={s.metaText}>{evento.hora}</Text>
              </View>
            )}
            {evento.turma && (
              <View style={s.metaItem}>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Circle cx="9" cy="7" r="4" stroke={colors.gray[400]} strokeWidth="2" />
                </Svg>
                <Text style={s.metaText}>{evento.turma}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────

export default function AgendaScreen() {
  const t        = useT();
  const [filter, setFilter] = useState<FilterType>('todos');
  const filtered = filter === 'todos' ? EVENTOS : EVENTOS.filter(e => e.tipo === filter);

  return (
    <View style={s.container}>
      <View style={s.body}>
        <TabBar value={filter} onChange={setFilter} />
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {filtered.map((e) => <EventoCard key={e.id} evento={e} />)}
          {filtered.length === 0 && (
            <View style={s.empty}>
              <Text style={s.emptyText}>{t('agenda.noEvents')}</Text>
            </View>
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

  card:      { flexDirection: 'row', gap: 0 },
  cardLeft:  { alignItems: 'center', width: 56 },
  dateBubble:{ width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dateDay:   { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  dateMonth: { fontSize: 11, fontWeight: '600', marginTop: -2 },
  connector: { width: 2, flex: 1, borderRadius: 1, marginVertical: 4, opacity: 0.25 },

  cardBody:      { flex: 1, backgroundColor: colors.base.white, borderRadius: 16, padding: 14, gap: 6, borderWidth: 1, borderColor: colors.gray[300], marginLeft: 4 },
  cardTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cardTitle:     { flex: 1, fontSize: 14, fontWeight: '700', color: colors.gray[900] },
  typeBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  cardDesc:      { fontSize: 13, color: colors.gray[500], lineHeight: 19 },
  cardMeta:      { flexDirection: 'row', gap: 12 },
  metaItem:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:      { fontSize: 12, color: colors.gray[400] },

  empty:     { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: colors.gray[400] },
});
