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

type TabDetalhe = 'cardapio' | 'nutricional';
type ViewState = 'home' | 'detalhe';

interface ItemCardapio {
  nomeKey: string;
  quantidade: number;
  unidadeKey: string;
}

interface ValorNutricional {
  nomeKey: string;
  quantidade: number;
}

interface Merenda {
  id: string;
  periodoKey: string;
  dataInicio: string;
  dataTermino: string;
  tipoRefeicaoKey: string;
  turnoKey: string;
  dias: string[];
  cardapio: ItemCardapio[];
  valoresNutricionais: ValorNutricional[];
}

// ─── Dados ───────────────────────────────────────────────

const merendas: Merenda[] = [
  {
    id: '1',
    periodoKey: 'merenda.period1',
    dataInicio: '05/02/2025',
    dataTermino: '05/03/2025',
    tipoRefeicaoKey: 'merenda.lunch',
    turnoKey: 'merenda.afternoon',
    dias: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    cardapio: [
      { nomeKey: 'merenda.foodRice', quantidade: 50, unidadeKey: 'merenda.grams' },
      { nomeKey: 'merenda.foodBeans', quantidade: 30, unidadeKey: 'merenda.grams' },
      { nomeKey: 'merenda.foodChicken', quantidade: 40, unidadeKey: 'merenda.grams' },
      { nomeKey: 'merenda.foodTomatoSalad', quantidade: 10, unidadeKey: 'merenda.grams' },
    ],
    valoresNutricionais: [
      { nomeKey: 'merenda.nutriCalories', quantidade: 10 },
      { nomeKey: 'merenda.nutriProteins', quantidade: 10 },
      { nomeKey: 'merenda.nutriLipids', quantidade: 10 },
      { nomeKey: 'merenda.nutriFibers', quantidade: 10 },
    ],
  },
  {
    id: '2',
    periodoKey: 'merenda.period2',
    dataInicio: '05/02/2025',
    dataTermino: '05/03/2025',
    tipoRefeicaoKey: 'merenda.lunch',
    turnoKey: 'merenda.afternoon',
    dias: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    cardapio: [
      { nomeKey: 'merenda.foodPasta', quantidade: 60, unidadeKey: 'merenda.grams' },
      { nomeKey: 'merenda.foodGroundBeef', quantidade: 35, unidadeKey: 'merenda.grams' },
      { nomeKey: 'merenda.foodVegetables', quantidade: 20, unidadeKey: 'merenda.grams' },
    ],
    valoresNutricionais: [
      { nomeKey: 'merenda.nutriCalories', quantidade: 12 },
      { nomeKey: 'merenda.nutriProteins', quantidade: 8 },
      { nomeKey: 'merenda.nutriLipids', quantidade: 5 },
      { nomeKey: 'merenda.nutriFibers', quantidade: 7 },
    ],
  },
];

const DIA_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Seg: { bg: colors.blueLight[50], border: colors.blue[200], text: colors.blue[700] },
  Ter: { bg: colors.pink[50], border: colors.pink[200], text: colors.pink[700] },
  Qua: { bg: colors.violet[50], border: colors.violet[200], text: colors.violet[700] },
  Qui: { bg: colors.orange[50], border: colors.orange[200], text: colors.orange[700] },
  Sex: { bg: colors.success[50], border: colors.success[200], text: colors.success[700] },
};

const DIA_KEYS: Record<string, string> = {
  Seg: 'common.daySeg',
  Ter: 'common.dayTer',
  Qua: 'common.dayQua',
  Qui: 'common.dayQui',
  Sex: 'common.daySex',
};

// ─── Tela ────────────────────────────────────────────────

export default function MerendaScreen() {
  const t = useT();
  const { setHideHeader } = useApp();
  const [viewState, setViewState] = useState<ViewState>('home');
  const [selected, setSelected] = useState<Merenda | null>(null);
  const [tab, setTab] = useState<TabDetalhe>('cardapio');

  useEffect(() => {
    setHideHeader(viewState !== 'home');
  }, [viewState]);

  useEffect(() => () => { setHideHeader(false); }, []);

  // ── Detalhes da Merenda ──
  if (viewState === 'detalhe' && selected) {
    return (
      <View style={styles.containerDetail}>
        {/* Sub-header */}
        <View style={styles.subHeader}>
          <TouchableOpacity
            onPress={() => { setViewState('home'); setTab('cardapio'); }}
            style={styles.backBtn}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>{t('merenda.details')}</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.detailBody}>
          <View style={styles.whiteCard}>
            {/* Tabs underline */}
            <View style={styles.underlineTabs}>
              <TouchableOpacity
                style={[styles.underlineTab, tab === 'cardapio' && styles.underlineTabActive]}
                onPress={() => setTab('cardapio')}
                activeOpacity={0.7}
              >
                {tab === 'cardapio' && (
                  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 6L9 17l-5-5" stroke={colors.brand[700]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
                <Text style={[styles.underlineTabText, tab === 'cardapio' && styles.underlineTabTextActive]}>
                  {t('merenda.cardapio')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.underlineTab, tab === 'nutricional' && styles.underlineTabActive]}
                onPress={() => setTab('nutricional')}
                activeOpacity={0.7}
              >
                {tab === 'nutricional' && (
                  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 6L9 17l-5-5" stroke={colors.brand[700]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
                <Text style={[styles.underlineTabText, tab === 'nutricional' && styles.underlineTabTextActive]}>
                  {t('merenda.nutricional')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Filter chips */}
            <View style={styles.chipsRow}>
              <View style={styles.chipGreen}>
                <Text style={styles.chipGreenText}>{t(selected.periodoKey)}</Text>
              </View>
              <View style={styles.chipBlue}>
                <Text style={styles.chipBlueText}>{t(selected.tipoRefeicaoKey)}</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {tab === 'cardapio'
                ? selected.cardapio.map((item, idx) => (
                    <View key={idx} style={styles.card}>
                      <Text style={styles.cardTitle}>{t(item.nomeKey)}</Text>
                      <View style={styles.cardTable}>
                        <View style={styles.cardRow}>
                          <Text style={styles.cardLabel}>{t('merenda.quantity')}</Text>
                          <Text style={styles.cardValue}>{item.quantidade}</Text>
                        </View>
                        <View style={[styles.cardRow, styles.cardRowBorder]}>
                          <Text style={styles.cardLabel}>{t('merenda.unit')}</Text>
                          <Text style={styles.cardValue}>{t(item.unidadeKey)}</Text>
                        </View>
                      </View>
                    </View>
                  ))
                : selected.valoresNutricionais.map((item, idx) => (
                    <View key={idx} style={styles.card}>
                      <Text style={styles.cardTitle}>{t(item.nomeKey)}</Text>
                      <View style={styles.cardTable}>
                        <View style={styles.cardRow}>
                          <Text style={styles.cardLabel}>{t('merenda.quantity')}</Text>
                          <Text style={styles.cardValue}>{item.quantidade}</Text>
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

  // ── Home Merenda ──
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {merendas.map((merenda) => (
          <View key={merenda.id} style={styles.card}>
            <Text style={styles.cardTitle}>{t(merenda.periodoKey)}</Text>

            <View style={styles.cardTable}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>{t('merenda.startDate')}</Text>
                <Text style={styles.cardValue}>{merenda.dataInicio}</Text>
              </View>
              <View style={[styles.cardRow, styles.cardRowBorder]}>
                <Text style={styles.cardLabel}>{t('merenda.endDate')}</Text>
                <Text style={styles.cardValue}>{merenda.dataTermino}</Text>
              </View>
              <View style={[styles.cardRow, styles.cardRowBorder]}>
                <Text style={styles.cardLabel}>{t('merenda.mealType')}</Text>
                <View style={styles.chipBlue}>
                  <Text style={styles.chipBlueText}>{t(merenda.tipoRefeicaoKey)}</Text>
                </View>
              </View>
              <View style={[styles.cardRow, styles.cardRowBorder]}>
                <Text style={styles.cardLabel}>{t('merenda.shift')}</Text>
                <Text style={styles.cardValue}>{t(merenda.turnoKey)}</Text>
              </View>
              <View style={[styles.cardRow, styles.cardRowBorder, { alignItems: 'flex-start', paddingVertical: 12 }]}>
                <Text style={styles.cardLabel}>{t('merenda.weekDays')}</Text>
                <View style={styles.diasGrid}>
                  {merenda.dias.map((dia) => {
                    const c = DIA_COLORS[dia] ?? DIA_COLORS.Seg;
                    return (
                      <View key={dia} style={[styles.diaChip, { backgroundColor: c.bg, borderColor: c.border }]}>
                        <Text style={[styles.diaChipText, { color: c.text }]}>{t(DIA_KEYS[dia] ?? dia)}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            <Button
              label={t('merenda.view')}
              variant="secondary"
              size="sm"
              onPress={() => { setSelected(merenda); setViewState('detalhe'); }}
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

  // Underline tabs
  underlineTabs: {
    flexDirection: 'row',
    backgroundColor: colors.base.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  underlineTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  underlineTabActive: {
    borderBottomColor: colors.brand[600],
  },
  underlineTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[400],
  },
  underlineTabTextActive: {
    color: colors.brand[700],
    fontWeight: '600',
  },

  // Filter chips
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
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
  chipBlue: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.blueLight[50],
    borderWidth: 1,
    borderColor: colors.blue[200],
  },
  chipBlueText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.blue[700],
  },

  // Scroll content
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 16,
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

  // Dias da semana
  diasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  diaChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  diaChipText: {
    fontSize: 12,
    fontWeight: '600',
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
