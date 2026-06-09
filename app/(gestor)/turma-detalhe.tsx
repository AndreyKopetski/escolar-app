import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Pressable, Animated,
} from 'react-native';
import Svg, { Path, Rect as SvgRect, Text as SvgText } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

// ─── Student data per turma ───────────────────────────────

type Student = { iniciais: string; nome: string };

const TURMA_STUDENTS: Record<string, Student[]> = {
  'Pré I – A': [
    { iniciais: 'TK', nome: 'Thomas Kopetski' },   { iniciais: 'JK', nome: 'Julia Kopetski' },
    { iniciais: 'AB', nome: 'Ana Beatriz Lima' },   { iniciais: 'CE', nome: 'Carlos Eduardo Souza' },
    { iniciais: 'MF', nome: 'Mariana Ferreira' },   { iniciais: 'PH', nome: 'Pedro Henrique Rocha' },
    { iniciais: 'GS', nome: 'Gabriela Santos' },    { iniciais: 'LR', nome: 'Lucas Rodrigues' },
    { iniciais: 'SA', nome: 'Sofia Almeida' },      { iniciais: 'RF', nome: 'Rafael Faria' },
    { iniciais: 'IL', nome: 'Isabella Lima' },      { iniciais: 'MG', nome: 'Marcos Gomes' },
    { iniciais: 'LT', nome: 'Laura Teixeira' },     { iniciais: 'MT', nome: 'Mateus Torres' },
    { iniciais: 'VS', nome: 'Valentina Silva' },    { iniciais: 'GB', nome: 'Gabriel Barbosa' },
    { iniciais: 'AL', nome: 'Alice Lemos' },        { iniciais: 'JO', nome: 'João Oliveira' },
    { iniciais: 'BP', nome: 'Beatriz Pinto' },      { iniciais: 'RS', nome: 'Rodrigo Sousa' },
    { iniciais: 'CF', nome: 'Camila Freitas' },     { iniciais: 'FE', nome: 'Felipe Esteves' },
  ],
  'Pré I – B': [
    { iniciais: 'AS', nome: 'Amanda Silva' },       { iniciais: 'BL', nome: 'Bruno Lima' },
    { iniciais: 'CA', nome: 'Carla Araújo' },       { iniciais: 'DM', nome: 'Diego Martins' },
    { iniciais: 'EV', nome: 'Eduarda Vieira' },     { iniciais: 'FC', nome: 'Fábio Costa' },
    { iniciais: 'GR', nome: 'Giovana Ramos' },      { iniciais: 'HR', nome: 'Henrique Ribeiro' },
    { iniciais: 'IO', nome: 'Igor Oliveira' },      { iniciais: 'JN', nome: 'Juliana Nunes' },
    { iniciais: 'KP', nome: 'Kaio Pereira' },       { iniciais: 'LE', nome: 'Letícia Esteves' },
    { iniciais: 'MN', nome: 'Murilo Neves' },       { iniciais: 'NR', nome: 'Nicole Rocha' },
    { iniciais: 'OB', nome: 'Otávio Brito' },       { iniciais: 'PA', nome: 'Patrícia Azevedo' },
    { iniciais: 'QO', nome: 'Quézia Oliveira' },    { iniciais: 'RV', nome: 'Ricardo Viana' },
    { iniciais: 'SM', nome: 'Sara Machado' },       { iniciais: 'TB', nome: 'Tiago Bastos' },
    { iniciais: 'UM', nome: 'Uêslei Monteiro' },
  ],
  '4º Ano – A': [
    { iniciais: 'LF', nome: 'Lucas Ferreira' },     { iniciais: 'IS', nome: 'Isabela Santos' },
    { iniciais: 'RM', nome: 'Renata Moura' },       { iniciais: 'TC', nome: 'Thiago Carvalho' },
    { iniciais: 'DS', nome: 'Diego Santana' },      { iniciais: 'PL', nome: 'Patrícia Leal' },
    { iniciais: 'AM', nome: 'Aline Matos' },        { iniciais: 'BR', nome: 'Bruno Rodrigues' },
    { iniciais: 'CM', nome: 'Camila Monteiro' },    { iniciais: 'DV', nome: 'Daniel Vasconcelos' },
    { iniciais: 'ER', nome: 'Elisa Ramos' },        { iniciais: 'FC', nome: 'Fernando Correia' },
    { iniciais: 'GP', nome: 'Gustavo Prado' },      { iniciais: 'HN', nome: 'Helena Nogueira' },
    { iniciais: 'IA', nome: 'Igor Andrade' },       { iniciais: 'JS', nome: 'Joana Soares' },
    { iniciais: 'KR', nome: 'Karen Ramos' },        { iniciais: 'LB', nome: 'Leonardo Barbosa' },
    { iniciais: 'MR', nome: 'Marcos Reis' },        { iniciais: 'NS', nome: 'Nathalia Santos' },
    { iniciais: 'OC', nome: 'Oscar Cordeiro' },     { iniciais: 'PA', nome: 'Paula Azevedo' },
    { iniciais: 'QM', nome: 'Quilson Melo' },       { iniciais: 'RA', nome: 'Raquel Aguiar' },
    { iniciais: 'SO', nome: 'Sandro Oliveira' },    { iniciais: 'TL', nome: 'Tânia Leal' },
    { iniciais: 'UV', nome: 'Ubiracy Viana' },      { iniciais: 'VF', nome: 'Vera Ferreira' },
  ],
};

function getStudents(nome: string, total: number): Student[] {
  if (TURMA_STUDENTS[nome]) return TURMA_STUDENTS[nome].slice(0, total);
  return Array.from({ length: total }, (_, i) => ({ iniciais: `A${i + 1}`, nome: `Aluno ${i + 1}` }));
}

// ─── Types ────────────────────────────────────────────────

type Seat = Student & { presente: boolean };

// ─── Seat icon ────────────────────────────────────────────

function SeatIcon({ seat, empty, onPress }: { seat?: Seat; empty?: boolean; onPress?: () => void }) {
  if (empty || !seat) {
    return <View style={st.seatWrap} />;
  }
  const fill      = seat.presente ? colors.success[100] : colors.error[100];
  const stroke    = seat.presente ? colors.success[400] : colors.error[300];
  const textColor = seat.presente ? colors.success[700] : colors.error[500];

  return (
    <TouchableOpacity style={st.seatWrap} onPress={onPress} activeOpacity={0.75}>
      <Svg width={52} height={60} viewBox="0 0 34 40">
        <SvgRect x="2" y="1" width="30" height="23" rx="7" fill={fill} stroke={stroke} strokeWidth="1" />
        <SvgRect x="4" y="26" width="26" height="12" rx="5" fill={fill} stroke={stroke} strokeWidth="1" />
        <SvgText x="17" y="16" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill={textColor}>
          {seat.iniciais}
        </SvgText>
        {!seat.presente && (
          <>
            <Path d="M10 7 L24 20" stroke={colors.error[400]} strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M24 7 L10 20" stroke={colors.error[400]} strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
      </Svg>
    </TouchableOpacity>
  );
}

// ─── Student bottom sheet ─────────────────────────────────

function StudentSheet({ seat, turma, onClose }: { seat: Seat | null; turma: string; onClose: () => void }) {
  const t         = useT();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (seat) {
      setVisible(true);
      slideAnim.setValue(400);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 400, duration: 220, useNativeDriver: true })
        .start(() => setVisible(false));
    }
  }, [seat]);

  if (!visible) return null;

  const presente = seat?.presente ?? false;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={st.backdrop} onPress={onClose}>
        <Pressable>
          <Animated.View style={[st.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <View style={st.sheetHandle} />

            {/* Avatar + nome */}
            <View style={st.sheetTop}>
              <View style={[st.sheetAvatar, { backgroundColor: presente ? colors.success[100] : colors.error[100] }]}>
                <Text style={[st.sheetAvatarText, { color: presente ? colors.success[700] : colors.error[600] }]}>
                  {seat?.iniciais}
                </Text>
              </View>
              <View style={st.sheetInfo}>
                <Text style={st.sheetName}>{seat?.nome}</Text>
                <Text style={st.sheetTurma}>{turma}</Text>
              </View>
              <View style={[st.statusBadge, { backgroundColor: presente ? colors.success[50] : colors.error[50] }]}>
                <View style={[st.statusDot, { backgroundColor: presente ? colors.success[500] : colors.error[400] }]} />
                <Text style={[st.statusText, { color: presente ? colors.success[700] : colors.error[700] }]}>
                  {presente ? t('common.present') : t('common.absent')}
                </Text>
              </View>
            </View>

            {/* Detalhes */}
            <View style={st.sheetFields}>
              <View style={st.sheetField}>
                <Text style={st.sheetFieldLabel}>{t('turma.entry')}</Text>
                <Text style={st.sheetFieldValue}>{presente ? '07:32' : '—'}</Text>
              </View>
              <View style={st.sheetFieldDivider} />
              <View style={st.sheetField}>
                <Text style={st.sheetFieldLabel}>{t('turma.method')}</Text>
                <Text style={st.sheetFieldValue}>{presente ? t('turma.facialBiometrics') : '—'}</Text>
              </View>
              <View style={st.sheetFieldDivider} />
              <View style={st.sheetField}>
                <Text style={st.sheetFieldLabel}>{t('turma.monthFaults')}</Text>
                <Text style={[st.sheetFieldValue, { color: presente ? colors.gray[900] : colors.error[500] }]}>
                  {presente ? '1' : '3'}
                </Text>
              </View>
            </View>

            {/* Fechar */}
            <TouchableOpacity style={st.sheetCloseBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={st.sheetCloseBtnText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Tela ─────────────────────────────────────────────────

const COLS = 5;

export default function TurmaDetalheScreen() {
  const t      = useT();
  const router = useRouter();
  const { setHideHeader } = useApp();
  const params = useLocalSearchParams<{ nome: string; professor: string; alunos: string; presentes: string }>();

  const nome      = params.nome ?? '';
  const professor = params.professor ?? '';
  const total     = Number(params.alunos ?? 0);
  const presentes = Number(params.presentes ?? 0);
  const ausentes  = total - presentes;
  const pct       = Math.round((presentes / total) * 100);
  const barColor  = pct >= 90 ? colors.success[500] : pct >= 75 ? colors.warning[400] : colors.error[400];

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  useEffect(() => { setHideHeader(true); return () => setHideHeader(false); }, []);

  const students = getStudents(nome, total);
  const seats: Seat[] = students.map((s, i) => ({ ...s, presente: i < presentes }));

  const rows: (Seat | null)[][] = [];
  for (let i = 0; i < seats.length; i += COLS) {
    const row = seats.slice(i, i + COLS);
    while (row.length < COLS) row.push(null as any);
    rows.push(row);
  }

  return (
    <View style={st.container}>
      <View style={st.header}>
        <TouchableOpacity style={st.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={st.headerTitle}>{nome}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={st.body}>
        <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

          {/* Stats */}
          <View style={st.statsRow}>
            {[
              { v: String(total),     l: t('turma.enrolled'),  c: colors.gray[900] },
              { v: String(presentes), l: t('turma.present'),   c: colors.success[600] },
              { v: String(ausentes),  l: t('turma.absent'),    c: colors.error[500] },
              { v: `${pct}%`,         l: t('turma.attendance'), c: barColor },
            ].map((item, i, arr) => (
              <View key={item.l} style={{ flexDirection: 'row', flex: 1 }}>
                <View style={st.statItem}>
                  <Text style={[st.statValue, { color: item.c }]}>{item.v}</Text>
                  <Text style={st.statLabel}>{item.l}</Text>
                </View>
                {i < arr.length - 1 && <View style={st.statDivider} />}
              </View>
            ))}
          </View>

          <View style={st.progressTrack}>
            <View style={[st.progressFill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
          </View>

          {/* Professor */}
          <View style={st.teacherCard}>
            <View style={st.teacherAvatar}>
              <Text style={st.teacherInitials}>
                {professor.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </Text>
            </View>
            <View style={st.teacherInfo}>
              <Text style={st.teacherLabel}>{t('turma.teacher')}</Text>
              <Text style={st.teacherName}>{professor}</Text>
            </View>
            <View style={st.teacherStatusDot} />
          </View>

          {/* Map header + legend */}
          <View style={st.mapHeader}>
            <Text style={st.mapTitle}>{t('turma.classMap')}</Text>
            <View style={st.legend}>
              <View style={st.legendItem}>
                <View style={[st.legendSeat, { backgroundColor: colors.success[100], borderWidth: 1, borderColor: colors.success[400] }]} />
                <Text style={st.legendText}>{t('turma.presentLegend')}</Text>
              </View>
              <View style={st.legendItem}>
                <View style={[st.legendSeat, { backgroundColor: colors.error[100], borderWidth: 1, borderColor: colors.error[300] }]} />
                <Text style={st.legendText}>{t('turma.absentLegend')}</Text>
              </View>
            </View>
          </View>

          {/* Seat grid — 5 per row, no labels */}
          <View style={st.grid}>
            {rows.map((row, rowIdx) => (
              <View key={rowIdx} style={st.seatRow}>
                {row.map((seat, colIdx) => (
                  <SeatIcon
                    key={colIdx}
                    seat={seat ?? undefined}
                    empty={!seat}
                    onPress={seat ? () => setSelectedSeat(seat) : undefined}
                  />
                ))}
              </View>
            ))}
          </View>

          {/* Absent list */}
          <View style={st.nameSection}>
            <Text style={st.nameSectionTitle}>{t('turma.absentToday')}</Text>
            {seats.filter(s => !s.presente).length === 0 ? (
              <Text style={st.nameSectionEmpty}>{t('turma.allPresent')}</Text>
            ) : (
              <View style={st.absentList}>
                {seats.filter(s => !s.presente).map((s) => (
                  <TouchableOpacity key={s.iniciais} style={st.absentChip} activeOpacity={0.8} onPress={() => setSelectedSeat(s)}>
                    <View style={st.absentDot} />
                    <Text style={st.absentName}>{s.nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

        </ScrollView>
      </View>

      <StudentSheet seat={selectedSeat} turma={nome} onClose={() => setSelectedSeat(null)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[100] },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.gray[100],
  },
  backBtn:     { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[900] },

  body:   { flex: 1, backgroundColor: colors.base.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 16 },

  statsRow:    { flexDirection: 'row', backgroundColor: colors.gray[50], borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.gray[200] },
  statItem:    { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, backgroundColor: colors.gray[200] },
  statValue:   { fontSize: 22, fontWeight: '800' },
  statLabel:   { fontSize: 11, color: colors.gray[500] },

  progressTrack: { height: 8, backgroundColor: colors.gray[100], borderRadius: 4, overflow: 'hidden', marginTop: -8 },
  progressFill:  { height: 8, borderRadius: 4 },

  teacherCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.base.white, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.gray[200] },
  teacherAvatar:   { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brand[100], alignItems: 'center', justifyContent: 'center' },
  teacherInitials: { fontSize: 16, fontWeight: '700', color: colors.brand[700] },
  teacherInfo:     { flex: 1, gap: 2 },
  teacherLabel:    { fontSize: 11, color: colors.gray[400], fontWeight: '500' },
  teacherName:     { fontSize: 15, fontWeight: '600', color: colors.gray[900] },
  teacherStatusDot:{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success[500] },

  mapHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mapTitle:   { fontSize: 16, fontWeight: '700', color: colors.gray[900] },
  legend:     { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSeat: { width: 14, height: 14, borderRadius: 3 },
  legendText: { fontSize: 12, color: colors.gray[500] },

  grid:    { gap: 10 },
  seatRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  seatWrap:{ width: 52, height: 60 },

  nameSection:      { gap: 10 },
  nameSectionTitle: { fontSize: 15, fontWeight: '700', color: colors.gray[700] },
  nameSectionEmpty: { fontSize: 14, color: colors.gray[500] },
  absentList:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  absentChip:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.error[50], paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.error[100] },
  absentDot:        { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.error[400] },
  absentName:       { fontSize: 13, fontWeight: '500', color: colors.error[700] },

  // Bottom sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.base.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 36 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.gray[200], alignSelf: 'center', marginTop: 12, marginBottom: 20 },

  sheetTop:    { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 24, marginBottom: 20 },
  sheetAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  sheetAvatarText: { fontSize: 20, fontWeight: '800' },
  sheetInfo:   { flex: 1, gap: 3 },
  sheetName:   { fontSize: 17, fontWeight: '700', color: colors.gray[900] },
  sheetTurma:  { fontSize: 13, color: colors.gray[500] },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusDot:   { width: 7, height: 7, borderRadius: 4 },
  statusText:  { fontSize: 13, fontWeight: '600' },

  sheetFields: { flexDirection: 'row', marginHorizontal: 24, backgroundColor: colors.gray[50], borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.gray[200], marginBottom: 20 },
  sheetField:  { flex: 1, alignItems: 'center', gap: 4 },
  sheetFieldDivider: { width: 1, backgroundColor: colors.gray[200] },
  sheetFieldLabel:   { fontSize: 11, color: colors.gray[400] },
  sheetFieldValue:   { fontSize: 14, fontWeight: '700', color: colors.gray[900] },

  sheetCloseBtn:     { marginHorizontal: 24, backgroundColor: colors.gray[100], borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  sheetCloseBtnText: { fontSize: 15, fontWeight: '600', color: colors.gray[700] },
});
