import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, Pressable, Animated,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/constants/colors';

// ─── Types ────────────────────────────────────────────────

type TipoObservacao = 'Mérito' | 'Advertência' | 'Ocorrência';

interface Observacao {
  id: string;
  tipo: TipoObservacao;
  descricao: string;
  colaborador: string;
  data: string;
}

// ─── Dados ───────────────────────────────────────────────

const observacoes: Observacao[] = [
  {
    id: '1',
    tipo: 'Mérito',
    descricao: 'O aluno demonstra notável aptidão para atividades esportivas',
    colaborador: 'João da Silva',
    data: '10/03/2025',
  },
  {
    id: '2',
    tipo: 'Advertência',
    descricao: 'O comportamento do aluno tem se demonstrado inadequado durante as aulas.',
    colaborador: 'João da Silva',
    data: '09/03/2025',
  },
  {
    id: '3',
    tipo: 'Mérito',
    descricao: 'Excelente desempenho na apresentação de trabalho em grupo.',
    colaborador: 'Maria Carvalho',
    data: '05/03/2025',
  },
  {
    id: '4',
    tipo: 'Ocorrência',
    descricao: 'Aluno chegou atrasado pela terceira vez consecutiva nesta semana.',
    colaborador: 'Carlos Lima',
    data: '03/03/2025',
  },
];

// ─── Helpers ─────────────────────────────────────────────

function getTipoStyle(tipo: TipoObservacao) {
  switch (tipo) {
    case 'Mérito':
      return { bg: colors.success[50], border: colors.success[300], text: colors.success[700] };
    case 'Advertência':
      return { bg: colors.pink[50], border: colors.pink[300], text: colors.pink[700] };
    case 'Ocorrência':
      return { bg: colors.warning[50], border: colors.warning[300], text: colors.warning[700] };
  }
}

function TipoBadge({ tipo }: { tipo: TipoObservacao }) {
  const s = getTipoStyle(tipo);
  return (
    <View style={[styles.tipoBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={[styles.tipoText, { color: s.text }]}>{tipo}</Text>
    </View>
  );
}

// ─── Tela ────────────────────────────────────────────────

export default function DiarioScreen() {
  const [detalhe, setDetalhe] = useState<Observacao | null>(null);
  const sheetAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (detalhe) {
      sheetAnim.setValue(600);
      Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, damping: 25, stiffness: 200 }).start();
    }
  }, [detalhe]);

  function closeSheet() {
    Animated.timing(sheetAnim, { toValue: 600, duration: 220, useNativeDriver: true }).start(
      () => setDetalhe(null)
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {observacoes.map((obs) => (
          <View key={obs.id} style={styles.card}>
            <TipoBadge tipo={obs.tipo} />

            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Descrição</Text>
                <Text style={styles.tableValue} numberOfLines={2}>{obs.descricao}</Text>
              </View>
              <View style={[styles.tableRow, styles.tableRowBorder]}>
                <Text style={styles.tableLabel}>Colaborador</Text>
                <Text style={styles.tableValue}>{obs.colaborador}</Text>
              </View>
              <View style={[styles.tableRow, styles.tableRowBorder]}>
                <Text style={styles.tableLabel}>Data de cadastro</Text>
                <Text style={styles.tableValue}>{obs.data}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.visualizarBtn}
              onPress={() => setDetalhe(obs)}
              activeOpacity={0.8}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke={colors.brand[700]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <Circle cx="12" cy="12" r="3" stroke={colors.brand[700]} strokeWidth="1.8" />
              </Svg>
              <Text style={styles.visualizarText}>Visualizar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Sheet: Detalhes da Observação */}
      {detalhe && (
        <Modal transparent animationType="none" onRequestClose={closeSheet}>
          <View style={styles.overlay}>
            <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={closeSheet} />
            <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetAnim }] }]}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Detalhes da observação</Text>
                <TouchableOpacity onPress={closeSheet} style={styles.closeBtn}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path d="M18 6L6 18M6 6l12 12" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
              </View>

              <View style={styles.sheetBody}>
              <View style={styles.sheetGrid}>
                <View style={styles.sheetField}>
                  <Text style={styles.sheetLabel}>Tipo</Text>
                  <TipoBadge tipo={detalhe.tipo} />
                </View>
                <View style={styles.sheetField}>
                  <Text style={styles.sheetLabel}>Colaborador</Text>
                  <Text style={styles.sheetValue}>{detalhe.colaborador}</Text>
                </View>
              </View>

              <View style={[styles.sheetField, { marginBottom: 12 }]}>
                <Text style={styles.sheetLabel}>Data</Text>
                <Text style={styles.sheetValue}>{detalhe.data}</Text>
              </View>

              <View style={styles.sheetField}>
                <Text style={styles.sheetLabel}>Descrição</Text>
                <Text style={styles.sheetDesc}>{detalhe.descricao}</Text>
              </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
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
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  // Card
  card: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  tipoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  tipoText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Table dentro do card
  table: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.base.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tableRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  tableLabel: {
    fontSize: 13,
    color: colors.gray[500],
    flexShrink: 0,
  },
  tableValue: {
    fontSize: 13,
    color: colors.gray[800],
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
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
    marginBottom: 12,
  },
  sheetField: {
    flex: 1,
    gap: 4,
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
});
