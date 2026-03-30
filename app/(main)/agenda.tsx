import { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors } from '@/constants/colors';
import BimestreTabs from '@/components/BimestreTabs';

// ─── Types ────────────────────────────────────────────────

type DiaSemana = 'seg' | 'ter' | 'qua' | 'qui' | 'sex';

interface Aula {
  horario: string;
  materia: string;
}

// ─── Dados ───────────────────────────────────────────────

const aulasPorDia: Record<DiaSemana, Aula[]> = {
  seg: [
    { horario: '07:00', materia: 'Português'},
    { horario: '08:00', materia: 'Matemática' },
    { horario: '09:00', materia: 'Ciências' },
    { horario: '10:00', materia: 'História' },
    { horario: '11:00', materia: 'Geografia' },
  ],
  ter: [
    { horario: '07:00', materia: 'Matemática' },
    { horario: '08:00', materia: 'Inglês' },
    { horario: '09:00', materia: 'Artes' },
    { horario: '10:00', materia: 'Educação Física' },
    { horario: '11:00', materia: 'Ensino Religioso' },
  ],
  qua: [
    { horario: '07:00', materia: 'Ciências' },
    { horario: '08:00', materia: 'Português' },
    { horario: '09:00', materia: 'História' },
    { horario: '10:00', materia: 'Matemática' },
    { horario: '11:00', materia: 'Inglês' },
  ],
  qui: [
    { horario: '07:00', materia: 'História' },
    { horario: '08:00', materia: 'Geografia' },
    { horario: '09:00', materia: 'Português' },
    { horario: '10:00', materia: 'Artes' },
    { horario: '11:00', materia: 'Ciências' },
  ],
  sex: [
    { horario: '07:00', materia: 'Inglês' },
    { horario: '08:00', materia: 'Educação Física' },
    { horario: '09:00', materia: 'Matemática' },
    { horario: '10:00', materia: 'Ensino Religioso' },
    { horario: '11:00', materia: 'Português' },
  ],
};

const DIAS_TABS: { key: DiaSemana; label: string }[] = [
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
];

// ─── Tela ────────────────────────────────────────────────

export default function AulasScreen() {
  const [dia, setDia] = useState<DiaSemana>('seg');
  const aulas = aulasPorDia[dia];

  return (
    <View style={styles.container}>
      <BimestreTabs tabs={DIAS_TABS} active={dia} onChange={setDia} />

      <View style={styles.tableWrapper}>
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <Text style={[styles.tableHeaderText, { width: 100 }]}>Horário</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Aula</Text>
        </View>

        <FlatList
          data={aulas}
          keyExtractor={(item) => item.horario}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.tableRow, styles.tableBodyRow]}>
              <View style={{ width: 100, alignItems: 'flex-start' }}>
                <View style={styles.horarioChip}>
                  <Text style={styles.horarioText}>{item.horario}</Text>
                </View>
              </View>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.materia}</Text>
            </View>
          )}
        />
      </View>
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
  tableWrapper: {
    flex: 1,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.base.white,
  },
  tableRow: {
    flexDirection: 'row',
    
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tableHeaderRow: {
    backgroundColor: colors.gray[50],
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[500],
  },
  tableBodyRow: {
    height: 68,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tableCell: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
  },
  horarioChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: colors.blueLight[50],
    borderWidth: 1,
    borderColor: colors.blue[200],
  },
  horarioText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.blue[700],
  },
});
