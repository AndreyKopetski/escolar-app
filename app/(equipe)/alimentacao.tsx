import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

// ─── Mock data ────────────────────────────────────────────

const TOTAL_PORCOES = 252; // presentes + margem

const CARDAPIO = {
  dataKey: 'alim.menuDate',
  refeicoes: [
    {
      tipo: 'Café da manhã',
      hora: '07:00 – 08:00',
      icon: '☕',
      itensKeys: ['alim.item.oatmealBanana', 'alim.item.frenchBreadMargarine', 'alim.item.orangeJuice'],
    },
    {
      tipo: 'Lanche da manhã',
      hora: '09:30',
      icon: '🍎',
      itensKeys: ['alim.item.seasonalFruitApple', 'alim.item.chocolateDrink'],
    },
    {
      tipo: 'Almoço',
      hora: '11:30 – 13:00',
      icon: '🍽️',
      itensKeys: ['alim.item.whiteRice', 'alim.item.cariocaBeans', 'alim.item.grilledChickenTomato', 'alim.item.sauteedCarrot', 'alim.item.lettuceBeetSalad', 'alim.item.passionFruitJuice'],
    },
    {
      tipo: 'Lanche da tarde',
      hora: '15:00',
      icon: '🥐',
      itensKeys: ['alim.item.carrotCakeChocolate', 'alim.item.milkChocolateDrink'],
    },
  ],
};

const INGREDIENTES = [
  { nomeKey: 'alim.ing.oats',          valor: '8,4',  unidadeKey: 'alim.unit.kg',    categoriaKey: 'alim.cat.grains' },
  { nomeKey: 'alim.ing.banana',        valor: '126',  unidadeKey: 'alim.unit.un',    categoriaKey: 'alim.cat.fruits' },
  { nomeKey: 'alim.ing.frenchBread',   valor: '504',  unidadeKey: 'alim.unit.un',    categoriaKey: 'alim.cat.bakery' },
  { nomeKey: 'alim.ing.margarine',     valor: '3,2',  unidadeKey: 'alim.unit.kg',    categoriaKey: 'alim.cat.dairy' },
  { nomeKey: 'alim.ing.orange',        valor: '75',   unidadeKey: 'alim.unit.kg',    categoriaKey: 'alim.cat.fruits' },
  { nomeKey: 'alim.ing.apple',         valor: '126',  unidadeKey: 'alim.unit.un',    categoriaKey: 'alim.cat.fruits' },
  { nomeKey: 'alim.ing.chocolateUHT',  valor: '252',  unidadeKey: 'alim.unit.cx',    categoriaKey: 'alim.cat.beverages' },
  { nomeKey: 'alim.ing.rice',          valor: '25',   unidadeKey: 'alim.unit.kg',    categoriaKey: 'alim.cat.grains' },
  { nomeKey: 'alim.ing.beans',         valor: '18',   unidadeKey: 'alim.unit.kg',    categoriaKey: 'alim.cat.grains' },
  { nomeKey: 'alim.ing.chickenBreast', valor: '38',   unidadeKey: 'alim.unit.kg',    categoriaKey: 'alim.cat.proteins' },
  { nomeKey: 'alim.ing.cannedTomato',  valor: '6',    unidadeKey: 'alim.unit.latas', categoriaKey: 'alim.cat.preserves' },
  { nomeKey: 'alim.ing.carrot',        valor: '12',   unidadeKey: 'alim.unit.kg',    categoriaKey: 'alim.cat.vegetables' },
  { nomeKey: 'alim.ing.lettuce',       valor: '30',   unidadeKey: 'alim.unit.macos', categoriaKey: 'alim.cat.greens' },
  { nomeKey: 'alim.ing.beet',          valor: '15',   unidadeKey: 'alim.unit.kg',    categoriaKey: 'alim.cat.vegetables' },
  { nomeKey: 'alim.ing.passionFruit',  valor: '22',   unidadeKey: 'alim.unit.kg',    categoriaKey: 'alim.cat.fruits' },
  { nomeKey: 'alim.ing.carrotForCake', valor: '6',    unidadeKey: 'alim.unit.kg',    categoriaKey: 'alim.cat.vegetables' },
  { nomeKey: 'alim.ing.wheatFlour',    valor: '8',    unidadeKey: 'alim.unit.kg',    categoriaKey: 'alim.cat.grains' },
  { nomeKey: 'alim.ing.sugar',         valor: '5',    unidadeKey: 'alim.unit.kg',    categoriaKey: 'alim.cat.other' },
  { nomeKey: 'alim.ing.soyOil',        valor: '3',    unidadeKey: 'alim.unit.L',     categoriaKey: 'alim.cat.other' },
  { nomeKey: 'alim.ing.wholeMilk',     valor: '252',  unidadeKey: 'alim.unit.cx',    categoriaKey: 'alim.cat.dairy' },
];

const CATEGORIAS_KEYS = [...new Set(INGREDIENTES.map(i => i.categoriaKey))];

// ─── Components ───────────────────────────────────────────

type Tab = 'cardapio' | 'ingredientes';

function TabBar({ value, onChange }: { value: Tab; onChange: (tab: Tab) => void }) {
  const t = useT();
  const tabs: { key: Tab; label: string }[] = [
    { key: 'cardapio',     label: t('alim.menu') },
    { key: 'ingredientes', label: t('alim.ingredients') },
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

// ─── Tela ─────────────────────────────────────────────────

export default function AlimentacaoScreen() {
  const t    = useT();
  const [tab, setTab] = useState<Tab>('cardapio');

  return (
    <View style={s.container}>
      <View style={s.body}>
        {/* Estimativa topo */}
        <View style={s.topBanner}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"
              stroke={colors.warning[700]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={s.topBannerText}>
            {t('alim.mealsBanner', { n: TOTAL_PORCOES })}
          </Text>
        </View>

        <TabBar value={tab} onChange={setTab} />

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {tab === 'cardapio' && (
            <>
              <Text style={s.dateLabel}>{t(CARDAPIO.dataKey)}</Text>
              {CARDAPIO.refeicoes.map((r) => (
                <View key={r.tipo} style={s.card}>
                  <View style={s.refeicaoHeader}>
                    <Text style={s.refeicaoIcon}>{r.icon}</Text>
                    <View>
                      <Text style={s.refeicaoTipo}>{
                  r.tipo === 'Café da manhã' ? t('alim.breakfast')
                  : r.tipo === 'Lanche da manhã' ? t('alim.morningSnack')
                  : r.tipo === 'Almoço' ? t('alim.lunch')
                  : r.tipo === 'Lanche da tarde' ? t('alim.afternoonSnack')
                  : r.tipo
                }</Text>
                      <Text style={s.refeicaoHora}>{r.hora}</Text>
                    </View>
                  </View>
                  <View style={s.divider} />
                  {r.itensKeys.map((itemKey, i) => (
                    <View key={i} style={s.itemRow}>
                      <View style={s.itemDot} />
                      <Text style={s.itemText}>{t(itemKey)}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}

          {tab === 'ingredientes' && (
            <>
              <View style={s.ingredNote}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 22C17.523 22 22 17.523 22 12S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM11 12h1v4h1M12 8h.01"
                    stroke={colors.blue[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={s.ingredNoteText}>{t('alim.portionsNote', { n: TOTAL_PORCOES })}</Text>
              </View>

              {CATEGORIAS_KEYS.map((catKey) => (
                <View key={catKey}>
                  <Text style={s.catLabel}>{t(catKey)}</Text>
                  <View style={s.card}>
                    {INGREDIENTES.filter(i => i.categoriaKey === catKey).map((ing, idx, arr) => (
                      <View key={ing.nomeKey}>
                        <View style={s.ingRow}>
                          <Text style={s.ingNome}>{t(ing.nomeKey)}</Text>
                          <View style={s.ingBadge}>
                            <Text style={s.ingQtd}>{ing.valor} {t(ing.unidadeKey)}</Text>
                          </View>
                        </View>
                        {idx < arr.length - 1 && <View style={s.divider} />}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </>
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

  topBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.warning[50], borderBottomWidth: 1, borderBottomColor: colors.warning[200],
    paddingHorizontal: 16, paddingVertical: 12,
  },
  topBannerText: { fontSize: 13, color: colors.warning[800] },
  topBannerBold: { fontWeight: '800' },

  tabRow:        { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  tab:           { flex: 1, height: 32, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.gray[100] },
  tabActive:     { backgroundColor: colors.success[100] },
  tabText:       { fontSize: 13, fontWeight: '600', color: colors.gray[500] },
  tabTextActive: { color: colors.brand[700] },

  scroll:    { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  dateLabel: { fontSize: 13, color: colors.gray[500], fontWeight: '500' },

  card:    { backgroundColor: colors.base.white, borderRadius: 16, padding: 14, gap: 10, borderWidth: 1, borderColor: colors.gray[200] },
  divider: { height: 1, backgroundColor: colors.gray[100] },

  refeicaoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  refeicaoIcon:   { fontSize: 24 },
  refeicaoTipo:   { fontSize: 15, fontWeight: '700', color: colors.gray[900] },
  refeicaoHora:   { fontSize: 12, color: colors.gray[400], marginTop: 1 },
  itemRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemDot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.warning[400] },
  itemText:       { fontSize: 13, color: colors.gray[700], flex: 1 },

  ingredNote:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.blue[50], borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.blue[100] },
  ingredNoteText: { fontSize: 13, color: colors.blue[700], flex: 1 },

  catLabel: { fontSize: 12, fontWeight: '700', color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },

  ingRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
  ingNome:  { fontSize: 14, color: colors.gray[800], flex: 1 },
  ingBadge: { backgroundColor: colors.warning[50], paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  ingQtd:   { fontSize: 13, fontWeight: '700', color: colors.warning[700] },
});
