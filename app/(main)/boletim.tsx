import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, Pressable, FlatList, Animated,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useApp } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';
import BimestreTabs from '@/components/BimestreTabs';

// ─── Dados ───────────────────────────────────────────────

type Bimestre = '1' | '2' | '3' | '4' | 'final';

interface AvaliacaoDetalhe {
  nome: string;
  nota: number;
  data: string;
}

interface MateriaData {
  nome: string;
  avaliacoes: AvaliacaoDetalhe[];
}

const dadosPorBimestre: Record<'1' | '2' | '3' | '4', MateriaData[]> = {
  '1': [
    { nome: 'Português',        avaliacoes: [{ nome: 'Prova 1', nota: 8.0, data: '10/03/2025' }, { nome: 'Prova 2', nota: 7.5, data: '28/03/2025' }, { nome: 'Trabalho', nota: 9.0, data: '14/04/2025' }] },
    { nome: 'Matemática',       avaliacoes: [{ nome: 'Prova 1', nota: 5.0, data: '11/03/2025' }, { nome: 'Prova 2', nota: 0.0, data: '29/03/2025' }, { nome: 'Trabalho', nota: 6.0, data: '15/04/2025' }] },
    { nome: 'Ciências',         avaliacoes: [{ nome: 'Prova 1', nota: 7.0, data: '12/03/2025' }, { nome: 'Prova 2', nota: 8.0, data: '30/03/2025' }, { nome: 'Trabalho', nota: 7.5, data: '16/04/2025' }] },
    { nome: 'História',         avaliacoes: [{ nome: 'Prova 1', nota: 9.0, data: '13/03/2025' }, { nome: 'Prova 2', nota: 8.5, data: '31/03/2025' }, { nome: 'Trabalho', nota: 8.0, data: '17/04/2025' }] },
    { nome: 'Geografia',        avaliacoes: [{ nome: 'Prova 1', nota: 0.0, data: '14/03/2025' }, { nome: 'Prova 2', nota: 5.5, data: '01/04/2025' }, { nome: 'Trabalho', nota: 6.5, data: '18/04/2025' }] },
    { nome: 'Artes',            avaliacoes: [{ nome: 'Trabalho 1', nota: 9.5, data: '15/03/2025' }, { nome: 'Trabalho 2', nota: 10.0, data: '05/04/2025' }] },
    { nome: 'Educação Física',  avaliacoes: [{ nome: 'Avaliação Prática', nota: 9.0, data: '17/03/2025' }, { nome: 'Frequência', nota: 10.0, data: '10/04/2025' }] },
    { nome: 'Inglês',           avaliacoes: [{ nome: 'Prova 1', nota: 0.0, data: '18/03/2025' }, { nome: 'Oral', nota: 7.0, data: '08/04/2025' }, { nome: 'Trabalho', nota: 8.0, data: '20/04/2025' }] },
    { nome: 'Ensino Religioso', avaliacoes: [{ nome: 'Trabalho 1', nota: 8.5, data: '19/03/2025' }, { nome: 'Trabalho 2', nota: 9.0, data: '09/04/2025' }] },
  ],
  '2': [
    { nome: 'Português',        avaliacoes: [{ nome: 'Prova 1', nota: 7.0, data: '05/05/2025' }, { nome: 'Prova 2', nota: 6.5, data: '23/05/2025' }, { nome: 'Trabalho', nota: 8.0, data: '10/06/2025' }] },
    { nome: 'Matemática',       avaliacoes: [{ nome: 'Prova 1', nota: 4.0, data: '06/05/2025' }, { nome: 'Prova 2', nota: 0.0, data: '24/05/2025' }, { nome: 'Trabalho', nota: 5.0, data: '11/06/2025' }] },
    { nome: 'Ciências',         avaliacoes: [{ nome: 'Prova 1', nota: 8.5, data: '07/05/2025' }, { nome: 'Prova 2', nota: 7.0, data: '25/05/2025' }, { nome: 'Trabalho', nota: 0.0, data: '12/06/2025' }] },
    { nome: 'História',         avaliacoes: [{ nome: 'Prova 1', nota: 7.5, data: '08/05/2025' }, { nome: 'Prova 2', nota: 8.0, data: '26/05/2025' }, { nome: 'Trabalho', nota: 7.0, data: '13/06/2025' }] },
    { nome: 'Geografia',        avaliacoes: [{ nome: 'Prova 1', nota: 5.0, data: '09/05/2025' }, { nome: 'Prova 2', nota: 6.0, data: '27/05/2025' }, { nome: 'Trabalho', nota: 5.5, data: '14/06/2025' }] },
    { nome: 'Artes',            avaliacoes: [{ nome: 'Trabalho 1', nota: 8.0, data: '10/05/2025' }, { nome: 'Trabalho 2', nota: 0.0, data: '28/05/2025' }] },
    { nome: 'Educação Física',  avaliacoes: [{ nome: 'Avaliação Prática', nota: 10.0, data: '12/05/2025' }, { nome: 'Frequência', nota: 9.5, data: '02/06/2025' }] },
    { nome: 'Inglês',           avaliacoes: [{ nome: 'Prova 1', nota: 5.5, data: '13/05/2025' }, { nome: 'Oral', nota: 0.0, data: '03/06/2025' }, { nome: 'Trabalho', nota: 6.0, data: '18/06/2025' }] },
    { nome: 'Ensino Religioso', avaliacoes: [{ nome: 'Trabalho 1', nota: 9.5, data: '14/05/2025' }, { nome: 'Trabalho 2', nota: 8.0, data: '04/06/2025' }] },
  ],
  '3': [
    { nome: 'Português',        avaliacoes: [{ nome: 'Prova 1', nota: 7.5, data: '04/08/2025' }, { nome: 'Prova 2', nota: 0.0, data: '22/08/2025' }, { nome: 'Trabalho', nota: 7.0, data: '05/09/2025' }] },
    { nome: 'Matemática',       avaliacoes: [{ nome: 'Prova 1', nota: 6.0, data: '05/08/2025' }, { nome: 'Prova 2', nota: 6.5, data: '23/08/2025' }, { nome: 'Trabalho', nota: 7.0, data: '06/09/2025' }] },
    { nome: 'Ciências',         avaliacoes: [{ nome: 'Prova 1', nota: 9.0, data: '06/08/2025' }, { nome: 'Prova 2', nota: 8.5, data: '24/08/2025' }, { nome: 'Trabalho', nota: 9.5, data: '07/09/2025' }] },
    { nome: 'História',         avaliacoes: [{ nome: 'Prova 1', nota: 0.0, data: '07/08/2025' }, { nome: 'Prova 2', nota: 7.5, data: '25/08/2025' }, { nome: 'Trabalho', nota: 8.5, data: '08/09/2025' }] },
    { nome: 'Geografia',        avaliacoes: [{ nome: 'Prova 1', nota: 7.0, data: '08/08/2025' }, { nome: 'Prova 2', nota: 6.5, data: '26/08/2025' }, { nome: 'Trabalho', nota: 0.0, data: '09/09/2025' }] },
    { nome: 'Artes',            avaliacoes: [{ nome: 'Trabalho 1', nota: 10.0, data: '09/08/2025' }, { nome: 'Trabalho 2', nota: 9.5, data: '27/08/2025' }] },
    { nome: 'Educação Física',  avaliacoes: [{ nome: 'Avaliação Prática', nota: 9.5, data: '11/08/2025' }, { nome: 'Frequência', nota: 10.0, data: '01/09/2025' }] },
    { nome: 'Inglês',           avaliacoes: [{ nome: 'Prova 1', nota: 7.0, data: '12/08/2025' }, { nome: 'Oral', nota: 8.0, data: '02/09/2025' }, { nome: 'Trabalho', nota: 0.0, data: '15/09/2025' }] },
    { nome: 'Ensino Religioso', avaliacoes: [{ nome: 'Trabalho 1', nota: 9.0, data: '13/08/2025' }, { nome: 'Trabalho 2', nota: 9.5, data: '03/09/2025' }] },
  ],
  '4': [
    { nome: 'Português',        avaliacoes: [{ nome: 'Prova 1', nota: 8.5, data: '06/10/2025' }, { nome: 'Prova 2', nota: 9.0, data: '24/10/2025' }, { nome: 'Trabalho', nota: 8.0, data: '10/11/2025' }] },
    { nome: 'Matemática',       avaliacoes: [{ nome: 'Prova 1', nota: 0.0, data: '07/10/2025' }, { nome: 'Prova 2', nota: 7.5, data: '25/10/2025' }, { nome: 'Trabalho', nota: 6.5, data: '11/11/2025' }] },
    { nome: 'Ciências',         avaliacoes: [{ nome: 'Prova 1', nota: 8.0, data: '08/10/2025' }, { nome: 'Prova 2', nota: 9.5, data: '26/10/2025' }, { nome: 'Trabalho', nota: 8.5, data: '12/11/2025' }] },
    { nome: 'História',         avaliacoes: [{ nome: 'Prova 1', nota: 9.5, data: '09/10/2025' }, { nome: 'Prova 2', nota: 9.0, data: '27/10/2025' }, { nome: 'Trabalho', nota: 10.0, data: '13/11/2025' }] },
    { nome: 'Geografia',        avaliacoes: [{ nome: 'Prova 1', nota: 7.5, data: '10/10/2025' }, { nome: 'Prova 2', nota: 0.0, data: '28/10/2025' }, { nome: 'Trabalho', nota: 7.0, data: '14/11/2025' }] },
    { nome: 'Artes',            avaliacoes: [{ nome: 'Trabalho 1', nota: 10.0, data: '11/10/2025' }, { nome: 'Trabalho 2', nota: 9.5, data: '29/10/2025' }] },
    { nome: 'Educação Física',  avaliacoes: [{ nome: 'Avaliação Prática', nota: 10.0, data: '13/10/2025' }, { nome: 'Frequência', nota: 10.0, data: '03/11/2025' }] },
    { nome: 'Inglês',           avaliacoes: [{ nome: 'Prova 1', nota: 8.0, data: '14/10/2025' }, { nome: 'Oral', nota: 0.0, data: '04/11/2025' }, { nome: 'Trabalho', nota: 9.0, data: '18/11/2025' }] },
    { nome: 'Ensino Religioso', avaliacoes: [{ nome: 'Trabalho 1', nota: 9.5, data: '15/10/2025' }, { nome: 'Trabalho 2', nota: 10.0, data: '05/11/2025' }] },
  ],
};

const calcMedia = (avs: AvaliacaoDetalhe[]) =>
  Math.round((avs.reduce((s, a) => s + a.nota, 0) / avs.length) * 10) / 10;

const dadosFinais: MateriaData[] = dadosPorBimestre['1'].map((m, i) => {
  const medias = (['1', '2', '3', '4'] as const).map(
    (b) => calcMedia(dadosPorBimestre[b][i].avaliacoes)
  );
  return {
    nome: m.nome,
    avaliacoes: [
      { nome: 'Média 1º Bim', nota: medias[0], data: '—' },
      { nome: 'Média 2º Bim', nota: medias[1], data: '—' },
      { nome: 'Média 3º Bim', nota: medias[2], data: '—' },
      { nome: 'Média 4º Bim', nota: medias[3], data: '—' },
    ],
  };
});


const BIMESTRES_TABS = [
  { key: '1' as Bimestre, label: '1º Bim' },
  { key: '2' as Bimestre, label: '2º Bim' },
  { key: '3' as Bimestre, label: '3º Bim' },
  { key: '4' as Bimestre, label: '4º Bim' },
  { key: 'final' as Bimestre, label: 'Final' },
];

// ─── Helpers ─────────────────────────────────────────────

function getNotaStyle(nota: number) {
  if (nota >= 7.0) return { bg: colors.success[50], border: colors.success[200], text: colors.success[700] };
  if (nota > 0)    return { bg: colors.error[50],   border: colors.error[200],   text: colors.error[700]   };
  return               { bg: colors.base.white,  border: colors.gray[200],    text: colors.gray[700]    };
}

function NotaBadge({ nota, style }: { nota: number; style?: object }) {
  const c = getNotaStyle(nota);
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }, style]}>
      <Text style={[styles.badgeText, { color: c.text }]}>
        {nota.toFixed(1).replace('.', ',')}
      </Text>
    </View>
  );
}

// ─── Tela Principal ───────────────────────────────────────

export default function BoletimScreen() {
  const { nome } = useLocalSearchParams<{ nome: string }>();
  const { setDisplayName, setHideHeader } = useApp();

  const [bimestre, setBimestre] = useState<Bimestre>('1');
  const [materiaDetalhes, setMateriaDetalhes] = useState<string | null>(null);
  const [avaliacaoSheet, setAvaliacaoSheet] = useState<AvaliacaoDetalhe | null>(null);

  const sheetAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (avaliacaoSheet) {
      sheetAnim.setValue(600);
      Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, damping: 25, stiffness: 200 }).start();
    }
  }, [avaliacaoSheet]);

  function closeSheet() {
    Animated.timing(sheetAnim, { toValue: 600, duration: 220, useNativeDriver: true }).start(
      () => setAvaliacaoSheet(null)
    );
  }

  useEffect(() => {
    setHideHeader(!!materiaDetalhes);
  }, [materiaDetalhes]);

  useEffect(() => {
    if (nome) setDisplayName(nome);
  }, [nome]);

  const materias: MateriaData[] =
    bimestre === 'final' ? dadosFinais : dadosPorBimestre[bimestre as '1' | '2' | '3' | '4'];

  const avaliacoesDaMateria: AvaliacaoDetalhe[] =
    materias.find((m) => m.nome === materiaDetalhes)?.avaliacoes ?? [];

  // ── Vista de Detalhes ──
  if (materiaDetalhes) {
    return (
      <View style={styles.containerDetail}>
        {/* Header da tela de detalhes */}
        <View style={styles.detalhesHeader}>
          <TouchableOpacity onPress={() => { setMateriaDetalhes(null); }} style={styles.backBtn}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.detalhesTitle}>Avaliações</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Conteúdo */}
        <View style={styles.detailBody}>
        <View style={styles.whiteCard}>
          <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
            {/* Badges */}
            <View style={styles.badgesRow}>
              <View style={styles.greenBadge}><Text style={styles.greenBadgeText}>{materiaDetalhes}</Text></View>
              <View style={styles.greenBadge}>
                <Text style={styles.greenBadgeText}>
                  {bimestre === 'final' ? 'Final' : `${bimestre}º bimestre`}
                </Text>
              </View>
            </View>

            {/* Tabela */}
            <View style={styles.table}>
              {/* Header */}
              <View style={[styles.tableRow, styles.tableHeaderRow]}>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Avaliações</Text>
                <Text style={[styles.tableHeaderText, { width: 100, textAlign: 'center' }]}>Nota</Text>
                <Text style={[styles.tableHeaderText, { width: 64, textAlign: 'center' }]}>Ação</Text>
              </View>

              {avaliacoesDaMateria.map((av, idx) => (
                <View key={idx} style={[styles.tableRow, styles.tableBodyRow]}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{av.nome}</Text>
                  <View style={{ width: 100, alignItems: 'center' }}>
                    <NotaBadge nota={av.nota} style={{ width: 44 }} />
                  </View>
                  <View style={{ width: 64, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setAvaliacaoSheet(av)} style={styles.eyeBtn}>
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke={colors.gray[500]} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <Circle cx="12" cy="12" r="3" stroke={colors.gray[500]} strokeWidth="1.6" />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Linha de média */}
              <View style={[styles.tableRow, styles.mediaRow]}>
                <Text style={[styles.tableCell, { flex: 1, fontWeight: '700' }]}>Média</Text>
                <View style={{ width: 100, alignItems: 'center' }}>
                  <NotaBadge nota={calcMedia(avaliacoesDaMateria)} style={{ width: 44 }} />
                </View>
                <View style={{ width: 64 }} />
              </View>
            </View>
          </ScrollView>
        </View>
        </View>

        {/* Bottom Sheet: detalhe de avaliação */}
        {avaliacaoSheet && (
          <Modal transparent animationType="none" onRequestClose={closeSheet}>
            <View style={styles.overlay}>
              <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={closeSheet} />
              <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetAnim }] }]}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>
                  {bimestre === 'final' ? 'Detalhes da Média' : 'Detalhes da avaliação'}
                </Text>
                <TouchableOpacity onPress={closeSheet} style={styles.closeBtn}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path d="M18 6L6 18M6 6l12 12" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
              </View>
              <View style={styles.sheetBody}>
                {[
                  { label: 'Matéria', value: materiaDetalhes },
                  { label: 'Período', value: bimestre === 'final' ? 'Final' : `${bimestre}º bimestre` },
                  { label: 'Professor', value: 'Prof. Carlos Silva' },
                  { label: 'Nome da avaliação', value: avaliacaoSheet.nome },
                  { label: 'Data da avaliação', value: avaliacaoSheet.data },
                ].map(({ label, value }) => (
                  <View key={label} style={styles.sheetField}>
                    <Text style={styles.sheetFieldLabel}>{label}</Text>
                    <Text style={styles.sheetFieldValue}>{value}</Text>
                  </View>
                ))}
                <View style={styles.sheetField}>
                  <Text style={styles.sheetFieldLabel}>Nota da avaliação</Text>
                  <NotaBadge nota={avaliacaoSheet.nota} />
                </View>
                <View style={[styles.sheetField, { width: '100%' }]}>
                  <Text style={styles.sheetFieldLabel}>Observação</Text>
                  <Text style={styles.sheetFieldObs}>
                    O aluno tem apresentado um bom desenvolvimento na disciplina, demonstrando progresso consistente ao longo do período.
                  </Text>
                </View>
              </View>
              </Animated.View>
            </View>
          </Modal>
        )}
      </View>
    );
  }

  // ── Vista Principal ──
  return (
    <View style={styles.container}>
      <BimestreTabs tabs={BIMESTRES_TABS} active={bimestre} onChange={setBimestre} />

      {/* Tabela */}
      <View style={styles.tableWrapper}>
        {/* Header da tabela */}
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Disciplina</Text>
          <Text style={[styles.tableHeaderText, { width: 120, textAlign: 'center' }]}>Média</Text>
          <Text style={[styles.tableHeaderText, { width: 56, textAlign: 'center' }]}>Ação</Text>
        </View>

        <FlatList
          data={materias}
          keyExtractor={(item) => item.nome}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const media = calcMedia(item.avaliacoes);
            return (
              <View style={[styles.tableRow, styles.tableBodyRow]}>
                <Text style={[styles.tableCell, { flex: 1 }]}>{item.nome}</Text>
                <View style={{ width: 120, alignItems: 'center' }}>
                  <NotaBadge nota={media} style={{ paddingHorizontal: 0, minWidth: 44 }} />
                </View>
                <View style={{ width: 56, alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => setMateriaDetalhes(item.nome)} style={styles.eyeBtn}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke={colors.gray[500]} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      <Circle cx="12" cy="12" r="3" stroke={colors.gray[500]} strokeWidth="1.6" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

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
  // Table
  tableWrapper: {
    flex: 1,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    overflow: 'hidden',
  },
  table: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    marginHorizontal: 16,
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
  tableBodyRow: {
    height: 68,
    paddingHorizontal: 16,
    backgroundColor: colors.base.white,
  },
  mediaRow: {
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: colors.gray[50],
    borderBottomWidth: 0,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[500],
  },
  tableCell: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
  },
  badge: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  eyeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Detalhes
  detalhesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.gray[100],
  },
  detalhesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  backBtn: {
    padding: 6,
    borderRadius: 6,
  },
  whiteCard: {
    flex: 1,
    backgroundColor: colors.base.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingTop: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  greenBadge: {
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[200],
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  greenBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.brand[700],
  },
  // Overlay / BottomSheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    backgroundColor: colors.gray[25],
  },
  sheetField: {
    width: 150,
    gap: 4,
  },
  sheetFieldLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[400],
  },
  sheetFieldValue: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[900],
  },
  sheetFieldObs: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[600],
    lineHeight: 20,
  },
  // Student Sheet
  studentSheetContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 20,
  },
  studentSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    lineHeight: 28,
  },
  studentSheetSubtitle: {
    fontSize: 13,
    color: colors.gray[600],
    lineHeight: 18,
  },
  anoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  anoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  anoBadgeActive: {
    backgroundColor: colors.success[100],
    borderColor: colors.success[200],
  },
  anoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[500],
  },
  anoTextActive: {
    color: colors.brand[700],
  },
  alunoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.base.white,
  },
  alunoItemActive: {
    borderColor: colors.brand[600],
    backgroundColor: colors.success[50],
  },
  alunoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  alunoIniciais: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand[700],
  },
  alunoNome: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  alunoTurma: {
    fontSize: 12,
    color: colors.gray[500],
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.brand[600],
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand[600],
  },
  btnConfirmar: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnConfirmarText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.base.white,
  },
  btnCancelar: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.base.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelarText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
  },
});
