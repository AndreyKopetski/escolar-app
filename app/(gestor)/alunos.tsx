import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

// ─── Mock data ────────────────────────────────────────────

export const ALUNOS_GESTOR = [
  { id: '1',  nome: 'Thomas Vrisman Kopetski', iniciais: 'TK', turma: 'Pré I – A',   matricula: '2025001' },
  { id: '2',  nome: 'Julia Kopetski',           iniciais: 'JK', turma: 'Pré I – A',   matricula: '2025002' },
  { id: '3',  nome: 'Ana Beatriz Lima',          iniciais: 'AB', turma: 'Pré I – B',   matricula: '2025003' },
  { id: '4',  nome: 'Carlos Eduardo Souza',      iniciais: 'CS', turma: 'Pré II – A',  matricula: '2025004' },
  { id: '5',  nome: 'Mariana Ferreira',          iniciais: 'MF', turma: '1º Ano – A',  matricula: '2025005' },
  { id: '6',  nome: 'Lucas Pereira Alves',       iniciais: 'LP', turma: '1º Ano – A',  matricula: '2025006' },
  { id: '7',  nome: 'Isabela Santos Costa',      iniciais: 'IS', turma: '2º Ano – B',  matricula: '2025007' },
  { id: '8',  nome: 'Pedro Henrique Rocha',      iniciais: 'PH', turma: '2º Ano – B',  matricula: '2025008' },
  { id: '9',  nome: 'Camila Rodrigues Nunes',    iniciais: 'CR', turma: '3º Ano – A',  matricula: '2025009' },
  { id: '10', nome: 'Gabriel Oliveira Mendes',   iniciais: 'GO', turma: '3º Ano – A',  matricula: '2025010' },
  { id: '11', nome: 'Thiago Carvalho Silva',     iniciais: 'TC', turma: '4º Ano – A',  matricula: '2025011' },
  { id: '12', nome: 'Renata Moura Barbosa',      iniciais: 'RM', turma: '4º Ano – A',  matricula: '2025012' },
  { id: '13', nome: 'Diego Santana Freitas',     iniciais: 'DS', turma: '5º Ano – A',  matricula: '2025013' },
  { id: '14', nome: 'Patrícia Leal Sousa',       iniciais: 'PL', turma: '5º Ano – A',  matricula: '2025014' },
];

// ─── Tela ─────────────────────────────────────────────────

export default function AlunosScreen() {
  const t       = useT();
  const router  = useRouter();
  const [query, setQuery] = useState('');

  const filtered = ALUNOS_GESTOR
    .filter((a) =>
      a.nome.toLowerCase().includes(query.toLowerCase()) ||
      a.turma.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  return (
    <View style={s.container}>
      <View style={s.body}>
        {/* Search bar */}
        <View style={s.searchWrap}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx="11" cy="11" r="7" stroke={colors.gray[400]} strokeWidth="2" />
            <Path d="M21 21l-4.35-4.35" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <TextInput
            style={s.searchInput}
            placeholder={t('alunos.search')}
            placeholderTextColor={colors.gray[400]}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          )}
        </View>

        {/* Counter */}
        <Text style={s.counter}>{filtered.length === 1 ? t('alunos.count', { n: 1 }) : t('alunos.countPlural', { n: filtered.length })}</Text>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>{t('alunos.noResult')}</Text>
            </View>
          ) : (
            <View style={s.listCard}>
              {filtered.map((aluno, idx) => (
                <View key={aluno.id}>
                  <TouchableOpacity
                    style={s.row}
                    activeOpacity={0.8}
                    onPress={() => router.push({
                      pathname: '/(gestor)/aluno-dados',
                      params: { id: aluno.id, nome: aluno.nome, iniciais: aluno.iniciais, turma: aluno.turma, matricula: aluno.matricula },
                    })}
                  >
                    <View style={s.avatar}>
                      <Text style={s.avatarText}>{aluno.iniciais}</Text>
                    </View>
                    <View style={s.info}>
                      <Text style={s.nome}>{aluno.nome}</Text>
                      <Text style={s.turmaText}>{aluno.turma} · {t('alunos.mat', { n: aluno.matricula })}</Text>
                    </View>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M9 18l6-6-6-6" stroke={colors.gray[300]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                  {idx < filtered.length - 1 && <View style={s.divider} />}
                </View>
              ))}
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

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 16, marginBottom: 4,
    backgroundColor: colors.gray[50], borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.gray[900], padding: 0 },

  counter: { fontSize: 12, color: colors.gray[400], paddingHorizontal: 16, marginBottom: 8, marginTop: 4 },

  scroll: { paddingHorizontal: 16, paddingBottom: 32, gap: 16 },

  listCard: { backgroundColor: colors.base.white, borderRadius: 16, borderWidth: 1, borderColor: colors.gray[300], overflow: 'hidden' },

  row:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  avatar:  { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.brand[100], alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700', color: colors.brand[700] },
  info:    { flex: 1, gap: 2 },
  nome:    { fontSize: 14, fontWeight: '600', color: colors.gray[900] },
  turmaText: { fontSize: 12, color: colors.gray[500] },
  divider: { height: 1, backgroundColor: colors.gray[100], marginLeft: 68 },

  empty:     { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: colors.gray[400] },
});
