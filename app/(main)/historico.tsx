import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, Pressable, FlatList, Animated,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useApp } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';
import BimestreTabs from '@/components/BimestreTabs';
import Button from '@/components/Button';
import { useT } from '@/hooks/useT';

// ─── Types ────────────────────────────────────────────────

type Bimestre = '1' | '2' | '3' | '4' | 'total';
type Status = 'PRESENÇA' | 'FALTA' | 'FALTA JUSTIFICADA';
type ViewState = 'home' | 'chamadas' | 'detalhe';

interface FrequenciaMateria {
  nome: string;
  presenca: number;
  falta: number;
}

interface Chamada {
  data: string;
}

interface DetalhePresenca {
  materia: string;
  status: Status;
  colaborador: string;
  justificativa?: Justificativa;
}

interface Justificativa {
  dataChamada: string;
  colaborador: string;
  materia: string;
  conteudo: string;
  descricao: string;
  arquivo: string;
}

// ─── Dados ───────────────────────────────────────────────

const frequenciaPorBimestre: Record<Bimestre, FrequenciaMateria[]> = {
  '1': [
    { nome: 'boletim.subj.portugues', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.matematica', presenca: 10, falta: 2 },
    { nome: 'boletim.subj.ciencias', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.historia', presenca: 10, falta: 2 },
    { nome: 'boletim.subj.geografia', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.artes', presenca: 10, falta: 2 },
    { nome: 'boletim.subj.edFisica', presenca: 10, falta: 1 },
    { nome: 'boletim.subj.ingles', presenca: 10, falta: 3 },
    { nome: 'boletim.subj.ensReligioso', presenca: 10, falta: 0 },
  ],
  '2': [
    { nome: 'boletim.subj.portugues', presenca: 9, falta: 1 },
    { nome: 'boletim.subj.matematica', presenca: 8, falta: 2 },
    { nome: 'boletim.subj.ciencias', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.historia', presenca: 9, falta: 1 },
    { nome: 'boletim.subj.geografia', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.artes', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.edFisica', presenca: 9, falta: 1 },
    { nome: 'boletim.subj.ingles', presenca: 8, falta: 2 },
    { nome: 'boletim.subj.ensReligioso', presenca: 10, falta: 0 },
  ],
  '3': [
    { nome: 'boletim.subj.portugues', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.matematica', presenca: 9, falta: 1 },
    { nome: 'boletim.subj.ciencias', presenca: 8, falta: 2 },
    { nome: 'boletim.subj.historia', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.geografia', presenca: 9, falta: 1 },
    { nome: 'boletim.subj.artes', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.edFisica', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.ingles', presenca: 9, falta: 1 },
    { nome: 'boletim.subj.ensReligioso', presenca: 10, falta: 0 },
  ],
  '4': [
    { nome: 'boletim.subj.portugues', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.matematica', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.ciencias', presenca: 9, falta: 1 },
    { nome: 'boletim.subj.historia', presenca: 8, falta: 2 },
    { nome: 'boletim.subj.geografia', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.artes', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.edFisica', presenca: 10, falta: 0 },
    { nome: 'boletim.subj.ingles', presenca: 9, falta: 1 },
    { nome: 'boletim.subj.ensReligioso', presenca: 10, falta: 0 },
  ],
  'total': [
    { nome: 'boletim.subj.portugues', presenca: 39, falta: 1 },
    { nome: 'boletim.subj.matematica', presenca: 37, falta: 5 },
    { nome: 'boletim.subj.ciencias', presenca: 37, falta: 3 },
    { nome: 'boletim.subj.historia', presenca: 37, falta: 5 },
    { nome: 'boletim.subj.geografia', presenca: 39, falta: 1 },
    { nome: 'boletim.subj.artes', presenca: 40, falta: 2 },
    { nome: 'boletim.subj.edFisica', presenca: 39, falta: 2 },
    { nome: 'boletim.subj.ingles', presenca: 36, falta: 7 },
    { nome: 'boletim.subj.ensReligioso', presenca: 40, falta: 0 },
  ],
};

const chamadas: Chamada[] = [
  { data: '10/02/2025' },
  { data: '09/02/2025' },
  { data: '08/02/2025' },
  { data: '07/02/2025' },
  { data: '06/02/2025' },
  { data: '05/02/2025' },
  { data: '04/02/2025' },
  { data: '03/02/2025' },
  { data: '01/02/2025' },
];

const JUSTIFICATIVA_PADRAO: Omit<Justificativa, 'materia' | 'conteudo'> = {
  dataChamada: '10/02/2025',
  colaborador: 'João da Silva',
  descricao:
    'O aluno não compareceu a aula no dia 10/02/2025 pois precisou realziar um consulta médica.',
  arquivo: 'atestado médico.pdf',
};

const detalhesPorData: Record<string, DetalhePresenca[]> = {
  '10/02/2025': [
    { materia: 'boletim.subj.portugues', status: 'PRESENÇA', colaborador: 'João da Silva' },
    { materia: 'boletim.subj.portugues', status: 'FALTA', colaborador: 'Maria Carvalho' },
    {
      materia: 'boletim.subj.ciencias', status: 'FALTA JUSTIFICADA', colaborador: 'João da Silva',
      justificativa: { ...JUSTIFICATIVA_PADRAO, materia: 'boletim.subj.ciencias', conteudo: 'Evolução' },
    },
    {
      materia: 'boletim.subj.historia', status: 'FALTA JUSTIFICADA', colaborador: 'João da Silva',
      justificativa: { ...JUSTIFICATIVA_PADRAO, materia: 'boletim.subj.historia', conteudo: 'Revolução Industrial' },
    },
    { materia: 'boletim.subj.geografia', status: 'FALTA', colaborador: 'Maria Carvalho' },
    { materia: 'boletim.subj.matematica', status: 'PRESENÇA', colaborador: 'João da Silva' },
    { materia: 'boletim.subj.artes', status: 'PRESENÇA', colaborador: 'João da Silva' },
  ],
  '09/02/2025': [
    { materia: 'boletim.subj.portugues', status: 'PRESENÇA', colaborador: 'João da Silva' },
    { materia: 'boletim.subj.matematica', status: 'PRESENÇA', colaborador: 'João da Silva' },
    { materia: 'boletim.subj.ciencias', status: 'PRESENÇA', colaborador: 'João da Silva' },
    { materia: 'boletim.subj.historia', status: 'PRESENÇA', colaborador: 'João da Silva' },
    { materia: 'boletim.subj.geografia', status: 'PRESENÇA', colaborador: 'João da Silva' },
  ],
};

const BIMESTRES_TABS: { key: Bimestre; label: string }[] = [
  { key: '1', label: '1º Bim' },
  { key: '2', label: '2º Bim' },
  { key: '3', label: '3º Bim' },
  { key: '4', label: '4º Bim' },
  { key: 'total', label: 'Final' },
];

// ─── Helpers ─────────────────────────────────────────────

function getStatusStyle(status: Status) {
  switch (status) {
    case 'PRESENÇA':
      return { bg: colors.success[50], border: colors.success[200], text: colors.success[700], icon: 'check' };
    case 'FALTA':
      return { bg: colors.error[50], border: colors.error[200], text: colors.error[700], icon: 'x' };
    case 'FALTA JUSTIFICADA':
      return { bg: colors.warning[50], border: colors.warning[200], text: colors.warning[700], icon: 'minus' };
  }
}

function StatusBadge({ status }: { status: Status }) {
  const t = useT();
  const s = getStatusStyle(status);
  const statusLabel = status === 'PRESENÇA'
    ? t('historico.presence')
    : status === 'FALTA'
      ? t('historico.absence')
      : t('historico.justified');
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        {s.icon === 'check' && (
          <Path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" stroke={s.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {s.icon === 'x' && (
          <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM15 9l-6 6M9 9l6 6" stroke={s.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {s.icon === 'minus' && (
          <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM8 12h8" stroke={s.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </Svg>
      <Text style={[styles.statusText, { color: s.text }]}>{statusLabel}</Text>
    </View>
  );
}

// ─── Tela ────────────────────────────────────────────────

export default function FrequenciaScreen() {
  const t = useT();
  const { setHideHeader } = useApp();
  const [bimestre, setBimestre] = useState<Bimestre>('1');
  const [viewState, setViewState] = useState<ViewState>('home');
  const [selectedData, setSelectedData] = useState<string>('10/02/2025');
  const [justificativa, setJustificativa] = useState<Justificativa | null>(null);
  const sheetAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    setHideHeader(viewState !== 'home');
  }, [viewState]);

  // Limpa ao desmontar
  useEffect(() => () => { setHideHeader(false); }, []);

  useEffect(() => {
    if (justificativa) {
      sheetAnim.setValue(600);
      Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, damping: 25, stiffness: 200 }).start();
    }
  }, [justificativa]);

  function closeSheet() {
    Animated.timing(sheetAnim, { toValue: 600, duration: 220, useNativeDriver: true }).start(
      () => setJustificativa(null)
    );
  }

  function goBack() {
    if (viewState === 'detalhe') setViewState('chamadas');
    else if (viewState === 'chamadas') setViewState('home');
  }

  const materias = frequenciaPorBimestre[bimestre];
  const detalhes = detalhesPorData[selectedData] ?? [];

  // ── Tela: Detalhe da Chamada ──
  if (viewState === 'detalhe') {
    return (
      <View style={styles.containerDetail}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>{t('historico.callDetails')}</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.detailBody}>
          <View style={styles.whiteCard}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Badge de data */}
              <View style={styles.dateBadgeRow}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>{selectedData}</Text>
                </View>
              </View>

              {/* Cards de presença */}
              {detalhes.map((item, idx) => (
                <View key={idx} style={styles.presencaCard}>
                  <View style={styles.presencaCardHeader}>
                    <Text style={styles.presencaMateria}>{t(item.materia)}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  <View style={styles.colaboradorRow}>
                    <Text style={styles.colaboradorLabel}>{t('historico.collaborator')}</Text>
                    <Text style={styles.colaboradorValue}>{item.colaborador}</Text>
                  </View>
                  {item.status === 'FALTA JUSTIFICADA' && item.justificativa && (
                    <Button
                      label={t('historico.view')}
                      variant="secondary"
                      size="sm"
                      onPress={() => setJustificativa(item.justificativa!)}
                      style={{ alignSelf: 'flex-end' }}
                      leftIcon={
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                          <Path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke={colors.brand[700]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          <Circle cx="12" cy="12" r="3" stroke={colors.brand[700]} strokeWidth="1.8" />
                        </Svg>
                      }
                    />
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Bottom Sheet: Detalhes da Justificativa */}
        {justificativa && (
          <Modal transparent animationType="none" onRequestClose={closeSheet}>
            <View style={styles.overlay}>
              <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={closeSheet} />
              <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetAnim }] }]}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{t('historico.justification')}</Text>
                <TouchableOpacity onPress={closeSheet} style={styles.closeBtn}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path d="M18 6L6 18M6 6l12 12" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
              </View>

              <View style={styles.sheetBody}>
              <View style={styles.sheetGrid}>
                <View style={styles.sheetField}>
                  <Text style={styles.sheetLabel}>{t('historico.callDate')}</Text>
                  <Text style={styles.sheetValue}>{justificativa.dataChamada}</Text>
                </View>
                <View style={styles.sheetField}>
                  <Text style={styles.sheetLabel}>{t('historico.collaborator')}</Text>
                  <Text style={styles.sheetValue}>{justificativa.colaborador}</Text>
                </View>
                <View style={styles.sheetField}>
                  <Text style={styles.sheetLabel}>{t('historico.subject')}</Text>
                  <Text style={styles.sheetValue}>{t(justificativa.materia)}</Text>
                </View>
                <View style={styles.sheetField}>
                  <Text style={styles.sheetLabel}>{t('historico.content')}</Text>
                  <Text style={styles.sheetValue}>{justificativa.conteudo}</Text>
                </View>
              </View>

              <View style={[styles.sheetField, { marginTop: 4, width: '100%' }]}>
                <Text style={styles.sheetLabel}>{t('historico.descr')}</Text>
                <Text style={styles.sheetDesc}>{justificativa.descricao}</Text>
              </View>

              <View style={[styles.sheetField, { marginTop: 12 }]}>
                <Text style={styles.sheetLabel}>{t('historico.file')}</Text>
                <View style={styles.arquivoCard}>
                  <View style={styles.pdfBadge}>
                    <Text style={styles.pdfText}>PDF</Text>
                  </View>
                  <Text style={styles.arquivoNome}>{justificativa.arquivo}</Text>
                  <TouchableOpacity style={styles.downloadBtn}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={colors.gray[500]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>
              </View>
              </Animated.View>
            </View>
          </Modal>
        )}
      </View>
    );
  }

  // ── Tela: Chamadas Realizadas ──
  if (viewState === 'chamadas') {
    return (
      <View style={styles.containerDetail}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>{t('historico.calls')}</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.detailBody}>
          <View style={styles.whiteCard}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
              <View style={styles.table}>
                {/* Header tabela */}
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>{t('historico.callDate')}</Text>
                  <Text style={[styles.tableHeaderText, { width: 64, textAlign: 'center' }]}>Ação</Text>
                </View>
                {chamadas.map((item) => (
                  <View key={item.data} style={[styles.tableRow, styles.tableBodyRow]}>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <View style={styles.dataChip}>
                        <Text style={styles.dataChipText}>{item.data}</Text>
                      </View>
                    </View>
                    <View style={{ width: 64, alignItems: 'center' }}>
                      <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => { setSelectedData(item.data); setViewState('detalhe'); }}
                      >
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                          <Path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke={colors.gray[500]} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          <Circle cx="12" cy="12" r="3" stroke={colors.gray[500]} strokeWidth="1.6" />
                        </Svg>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  // ── Tela: Home Frequência ──

  return (
    <View style={styles.container}>
      <BimestreTabs tabs={BIMESTRES_TABS} active={bimestre} onChange={setBimestre} />

      {/* Tabela */}
      <View style={styles.tableWrapper}>
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>{t('historico.subject')}</Text>
          <Text style={[styles.tableHeaderText, { width: 90, textAlign: 'center' }]}>{t('historico.presences')}</Text>
          <Text style={[styles.tableHeaderText, { width: 72, textAlign: 'center' }]}>{t('historico.absences')}</Text>
        </View>

        <FlatList
          data={materias}
          keyExtractor={(item) => item.nome}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.tableRow, styles.tableBodyRow]}>
              <Text style={[styles.tableCell, { flex: 1 }]}>{t(item.nome)}</Text>
              <View style={{ width: 90, alignItems: 'center' }}>
                <View style={styles.presencaBadge}>
                  <Text style={styles.presencaBadgeText}>{item.presenca}</Text>
                </View>
              </View>
              <View style={{ width: 72, alignItems: 'center' }}>
                <View style={[styles.presencaBadge, item.falta > 0 && styles.faltaBadge]}>
                  <Text style={[styles.presencaBadgeText, item.falta > 0 && styles.faltaBadgeText]}>
                    {item.falta}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>

      {/* Link Chamadas Realizadas */}
      <Button
        label={t('historico.viewCalls')}
        variant="tertiary"
        size="sm"
        onPress={() => setViewState('chamadas')}
        leftIcon={
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke={colors.brand[700]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        }
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  containerDetail: {
    flex: 1,
    backgroundColor: colors.base.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  detailBody: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },

  // Sub-header (chamadas / detalhe)
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.gray[100],
  },
  subHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabela
  tableWrapper: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: colors.base.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tableHeaderRow: {
    backgroundColor: colors.gray[50],
    height: 40,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[500],
  },
  tableBodyRow: {
    height: 68,
    paddingHorizontal: 16,
    backgroundColor: colors.base.white,
  },
  tableCell: {
    fontSize: 14,
    color: colors.gray[900],
    fontWeight: '500',
  },

  // Badges presença/falta
  presencaBadge: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.blueLight[50],
    borderColor: colors.blue[200],
    minWidth: 44,
    alignItems: 'center',
  },
  presencaBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.blue[700],
  },
  faltaBadge: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[200],
  },
  faltaBadgeText: {
    color: colors.error[700],
  },

  // Link chamadas realizadas
  chamadasLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 24,
    paddingBottom: 8,
  },
  chamadasLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand[700],
  },

  // White card (chamadas realizadas)
  whiteCard: {
    flex: 1,
    backgroundColor: colors.base.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingTop: 16,
  },

  // Table wrapper (chamadas realizadas)
  table: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },

  // Data chip (chamadas realizadas)
  dataChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: colors.violet[50],
    borderWidth: 1,
    borderColor: colors.violet[200],
  },
  dataChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.violet[700],
  },

  // Eye button
  eyeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll content (detalhe)
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },

  // Date badge (detalhe)
  dateBadgeRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  dateBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.success[100],
  },
  dateBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success[700],
  },

  // Card de presença (detalhe)
  presencaCard: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  presencaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presencaMateria: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Colaborador
  colaboradorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.base.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[200]
  },
  colaboradorLabel: {
    fontSize: 13,
    color: colors.gray[500],
  },
  colaboradorValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[800],
  },

  // Botão Visualizar
  visualizarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: colors.base.white,
    borderColor: colors.brand[300],
  },
  visualizarText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand[700],
  },

  // Overlay / Bottom sheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  overlayPress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.base.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    fontWeight: '500',
    color: colors.gray[900],
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  sheetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    marginBottom: 12,
  },
  sheetField: {
    width: '50%',
    gap: 2,
    marginBottom: 12,
  },
  sheetLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[400],
  },
  sheetValue: {
    fontSize: 14,
    color: colors.gray[800],
  },
  sheetDesc: {
    fontSize: 13,
    color: colors.gray[700],
    lineHeight: 20,
  },

  // Arquivo
  arquivoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginTop: 4,
  },
  pdfBadge: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.error[600],
  },
  arquivoNome: {
    flex: 1,
    fontSize: 13,
    color: colors.gray[800],
    fontWeight: '500',
  },
  downloadBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
