import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';
import { useT } from '@/hooks/useT';

// ─── Types ────────────────────────────────────────────────

type StatusLivro = 'Emprestado' | 'Atrasado' | 'Entregue';

interface Livro {
  id: string;
  tituloKey: string;
  dataEmprestimo: string;
  dataDevolucao: string;
  status: StatusLivro;
}

// ─── Dados ───────────────────────────────────────────────

const livros: Livro[] = [
  {
    id: '1',
    tituloKey: 'livros.title1',
    dataEmprestimo: '24/02/2025',
    dataDevolucao: '02/03/2025',
    status: 'Emprestado',
  },
  {
    id: '2',
    tituloKey: 'livros.title2',
    dataEmprestimo: '12/02/2025',
    dataDevolucao: '24/02/2025',
    status: 'Atrasado',
  },
  {
    id: '3',
    tituloKey: 'livros.title3',
    dataEmprestimo: '02/02/2025',
    dataDevolucao: '12/02/2025',
    status: 'Entregue',
  },
  {
    id: '4',
    tituloKey: 'livros.title4',
    dataEmprestimo: '10/01/2025',
    dataDevolucao: '20/01/2025',
    status: 'Entregue',
  },
];

// ─── Helpers ─────────────────────────────────────────────

function getStatusStyle(status: StatusLivro) {
  switch (status) {
    case 'Emprestado':
      return { bg: colors.warning[50], border: colors.warning[300], text: colors.warning[700] };
    case 'Atrasado':
      return { bg: colors.error[50], border: colors.error[300], text: colors.error[700] };
    case 'Entregue':
      return { bg: colors.success[50], border: colors.success[300], text: colors.success[700] };
  }
}

// ─── Tela ────────────────────────────────────────────────

export default function LivrosScreen() {
  const t = useT();
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {livros.map((livro) => {
          const s = getStatusStyle(livro.status);
          return (
            <View key={livro.id} style={styles.card}>
              <Text style={styles.cardTitle}>{t(livro.tituloKey)}</Text>

              <View style={styles.cardTable}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>{t('livros.loanDate')}</Text>
                  <Text style={styles.cardValue}>{livro.dataEmprestimo}</Text>
                </View>
                <View style={[styles.cardRow, styles.cardRowBorder]}>
                  <Text style={styles.cardLabel}>{t('livros.returnDate')}</Text>
                  <Text style={styles.cardValue}>{livro.dataDevolucao}</Text>
                </View>
                <View style={[styles.cardRow, styles.cardRowBorder]}>
                  <Text style={styles.cardLabel}>{t('livros.status')}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
                    <Text style={[styles.statusText, { color: s.text }]}>
                      {livro.status === 'Emprestado'
                        ? t('livros.statusBorrowed')
                        : livro.status === 'Atrasado'
                          ? t('livros.statusLate')
                          : t('livros.statusReturned')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
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
  scrollContent: {
    padding: 16,
    gap: 16,
  },
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
