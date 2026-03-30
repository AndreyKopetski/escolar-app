import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Animated, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp, Aluno } from '@/contexts/AppContext';
import Button from '@/components/Button';
import { colors, gradients } from '@/constants/colors';

const alunosPorAno: Record<string, Aluno[]> = {
  '2026': [
    { id: '1', nome: 'Thomas Vrisman Kopetski', iniciais: 'TK', turma: '9 Ano A', nivel: 'Ensino Fundamental II', foto: require('@/assets/images/avatar-thomas.jpg') },
    { id: '2', nome: 'Júlia Vrisman Kopetski',  iniciais: 'JK', turma: '6 Ano A', nivel: 'Ensino Fundamental II', foto: require('@/assets/images/avatar-julia.jpg') },
  ],
  '2025': [
    { id: '3', nome: 'Thomas Vrisman Kopetski', iniciais: 'TK', turma: '8 Ano A', nivel: 'Ensino Fundamental II', foto: require('@/assets/images/avatar-thomas.jpg') },
    { id: '4', nome: 'Júlia Vrisman Kopetski',  iniciais: 'JK', turma: '5 Ano A', nivel: 'Ensino Fundamental I',  foto: require('@/assets/images/avatar-julia.jpg') },
  ],
};

export default function AlunoSelectSheet() {
  const { isStudentSheetVisible, setStudentSheetVisible, activeStudent, setActiveStudent, setActiveYear } = useApp();

  const [anoTemp, setAnoTemp] = useState('2026');
  const [alunoTemp, setAlunoTemp] = useState<Aluno>(alunosPorAno['2026'][0]);
  const sheetAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (isStudentSheetVisible) {
      sheetAnim.setValue(600);
      Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, damping: 25, stiffness: 200 }).start();
    }
  }, [isStudentSheetVisible]);

  function closeSheet() {
    Animated.timing(sheetAnim, { toValue: 600, duration: 220, useNativeDriver: true }).start(
      () => setStudentSheetVisible(false)
    );
  }

  if (!isStudentSheetVisible) return null;

  return (
    <Modal transparent animationType="none" onRequestClose={closeSheet}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayPress} onPress={closeSheet} />
        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetAnim }] }]}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Selecione o aluno:</Text>
          <TouchableOpacity onPress={closeSheet} style={styles.closeBtn} activeOpacity={0.7}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M18 6L6 18M6 6l12 12" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        <View style={styles.sheetBody}>
          {/* Seleção de Ano */}
          <View style={styles.anoRow}>
            {['2026', '2025'].map((ano) => (
              <TouchableOpacity
                key={ano}
                style={[styles.anoBadge, anoTemp === ano && styles.anoBadgeActive]}
                onPress={() => { setAnoTemp(ano); setAlunoTemp(alunosPorAno[ano][0]); }}
                activeOpacity={0.7}
              >
                {anoTemp === ano && (
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 6L9 17l-5-5" stroke={colors.brand[700]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
                <Text style={[styles.anoText, anoTemp === ano && styles.anoTextActive]}>{ano}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Lista de Alunos */}
          <View style={{ gap: 16 }}>
            {alunosPorAno[anoTemp].map((aluno) => {
              const sel = alunoTemp.id === aluno.id;
              const nomeExibido = aluno.id === activeStudent.id ? activeStudent.nome : aluno.nome;
              return (
                <TouchableOpacity
                  key={aluno.id}
                  style={[styles.alunoItem, sel && styles.alunoItemActive]}
                  onPress={() => setAlunoTemp({ ...aluno, nome: nomeExibido })}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={gradients.brand}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.alunoAvatarBorder}
                  >
                    <View style={styles.alunoAvatar}>
                      {aluno.foto
                        ? <Image source={aluno.foto} style={styles.alunoAvatarImage} />
                        : <Text style={styles.alunoIniciais}>{aluno.iniciais}</Text>
                      }
                    </View>
                  </LinearGradient>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[styles.alunoNome, sel && { color: colors.brand[700] }]}>{nomeExibido}</Text>
                    <Text style={styles.alunoTurma}>{aluno.turma} - {aluno.nivel}</Text>
                  </View>
                  <View style={[styles.radio, sel && styles.radioActive]}>
                    {sel && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botões */}
          <Button
            label="Visualizar Aluno"
            size="xl"
            fullWidth
            onPress={() => { setActiveStudent(alunoTemp); setActiveYear(anoTemp); closeSheet(); }}
          />
        </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    overflow: 'hidden',
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  subtitle: {
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
    borderRadius: 8,
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
  alunoAvatarBorder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alunoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.success[100],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  alunoAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
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
});
