import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useApp } from '@/contexts/AppContext';
import Button from '@/components/Button';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

// ─── Types ────────────────────────────────────────────────

type ViewState = 'home' | 'detalhe';

interface ItemMaterial {
  nomeKey: string;
  quantidade: number;
  observacao: string | null;
}

interface ListaMaterial {
  id: string;
  tituloKey: string;
  ano: string;
  nivelEnsinoKey: string;
  itens: ItemMaterial[];
}

// ─── Dados ───────────────────────────────────────────────

const listas: ListaMaterial[] = [
  {
    id: '1',
    tituloKey: 'material.title1',
    ano: '2025',
    nivelEnsinoKey: 'material.levelEarlyChildhood',
    itens: [
      { nomeKey: 'material.item.pencil', quantidade: 3, observacao: null },
      { nomeKey: 'material.item.eraser', quantidade: 3, observacao: null },
      { nomeKey: 'material.item.pencilSharpener', quantidade: 3, observacao: null },
      { nomeKey: 'material.item.subjectNotebook', quantidade: 3, observacao: null },
      { nomeKey: 'material.item.scissors', quantidade: 1, observacao: null },
      { nomeKey: 'material.item.glueStick', quantidade: 2, observacao: null },
    ],
  },
];

// ─── Tela ────────────────────────────────────────────────

export default function MaterialScreen() {
  const t = useT();
  const { setHideHeader } = useApp();
  const [viewState, setViewState] = useState<ViewState>('home');
  const [selected, setSelected] = useState<ListaMaterial | null>(null);

  useEffect(() => {
    setHideHeader(viewState !== 'home');
  }, [viewState]);

  useEffect(() => () => { setHideHeader(false); }, []);

  // ── Detalhes do Material ──
  if (viewState === 'detalhe' && selected) {
    return (
      <View style={styles.containerDetail}>
        {/* Sub-header */}
        <View style={styles.subHeader}>
          <TouchableOpacity
            onPress={() => setViewState('home')}
            style={styles.backBtn}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>{t('material.details')}</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.detailBody}>
          <View style={styles.whiteCard}>
            {/* Filter chips */}
            <View style={styles.chipsRow}>
              <View style={styles.chipGreen}>
                <Text style={styles.chipGreenText}>{t(selected.tituloKey)}</Text>
              </View>
              <View style={styles.chipViolet}>
                <Text style={styles.chipVioletText}>{selected.ano}</Text>
              </View>
              <View style={styles.chipWarning}>
                <Text style={styles.chipWarningText}>{t(selected.nivelEnsinoKey)}</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {selected.itens.map((item, idx) => (
                <View key={idx} style={styles.card}>
                  <Text style={styles.cardTitle}>{t(item.nomeKey)}</Text>
                  <View style={styles.cardTable}>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>{t('material.quantity')}</Text>
                      <Text style={styles.cardValue}>{item.quantidade}</Text>
                    </View>
                    <View style={[styles.cardRow, styles.cardRowBorder]}>
                      <Text style={styles.cardLabel}>{t('material.observation')}</Text>
                      <Text style={[styles.cardValue, !item.observacao && styles.cardValueEmpty]}>
                        {item.observacao ?? '---'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  // ── Home Material ──
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {listas.map((lista) => (
          <View key={lista.id} style={styles.card}>
            <Text style={styles.cardTitle}>{t(lista.tituloKey)}</Text>

            <View style={styles.cardTable}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>{t('material.year')}</Text>
                <View style={styles.chipViolet}>
                  <Text style={styles.chipVioletText}>{lista.ano}</Text>
                </View>
              </View>
              <View style={[styles.cardRow, styles.cardRowBorder]}>
                <Text style={styles.cardLabel}>{t('material.level')}</Text>
                <View style={styles.chipWarning}>
                  <Text style={styles.chipWarningText}>{t(lista.nivelEnsinoKey)}</Text>
                </View>
              </View>
            </View>

            <Button
              label={t('material.view')}
              variant="secondary"
              size="sm"
              onPress={() => { setSelected(lista); setViewState('detalhe'); }}
              style={{ alignSelf: 'flex-end' }}
              leftIcon={
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke={colors.brand[700]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <Circle cx="12" cy="12" r="3" stroke={colors.brand[700]} strokeWidth="1.8" />
                </Svg>
              }
            />
          </View>
        ))}
      </ScrollView>
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
  whiteCard: {
    flex: 1,
    backgroundColor: colors.base.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },

  // Sub-header
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

  // Filter chips row
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Chips
  chipGreen: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.success[100],
  },
  chipGreenText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success[700],
  },
  chipViolet: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.violet[50],
    borderWidth: 1,
    borderColor: colors.violet[200],
  },
  chipVioletText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.violet[700],
  },
  chipWarning: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.warning[50],
    borderWidth: 1,
    borderColor: colors.warning[200],
  },
  chipWarningText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.warning[700],
  },

  // Scroll content
  scrollContent: {
    padding: 16,
    gap: 12,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
  },
  cardTable: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.base.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  cardRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  cardLabel: {
    fontSize: 13,
    color: colors.gray[500],
  },
  cardValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[800],
  },
  cardValueEmpty: {
    color: colors.gray[400],
    fontWeight: '400',
  },

  // Visualizar button
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
});
