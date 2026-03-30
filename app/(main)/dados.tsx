import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Switch, Image,
} from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import Button from '@/components/Button';
import { colors, gradients } from '@/constants/colors';

const STUDENT_PHOTOS: Record<string, number> = {
  TK: require('@/assets/images/avatar-thomas.jpg'),
  JK: require('@/assets/images/avatar-julia.jpg'),
};

// ─── Types ────────────────────────────────────────────────

type ViewState = 'home' | 'basicas' | 'basicas-edit' | 'medica' | 'medica-edit';

interface InfoBasicas {
  nome: string;
  cpf: string;
  dataNascimento: string;
  genero: string;
  matricula: string;
  dataMatricula: string;
}

interface FichaMedica {
  altura: string;
  peso: string;
  tipoSanguineo: string;
  carteiraSUS: string;
  contatoEmergencia: string;
  nomeContatoEmergencia: string;
  hospitalEmergencia: string;
  neurodivergente: boolean;
  pcd: boolean;
  alergicaMedicamento: string | null;
  alergicaAlimento: string | null;
  doencaCongenita: string | null;
  fumante: string | null;
  caxumba: string | null;
}

// ─── Dados ───────────────────────────────────────────────

const INITIAL_BASICAS: InfoBasicas = {
  nome: 'João Oliveira',
  cpf: '123.456.789-89',
  dataNascimento: '24/08/2007',
  genero: 'Masculino',
  matricula: '123456',
  dataMatricula: '02/02/2025',
};

const INITIAL_MEDICA: FichaMedica = {
  altura: '1,50',
  peso: '65',
  tipoSanguineo: 'A+',
  carteiraSUS: '123456789',
  contatoEmergencia: '(42) 98765-4321',
  nomeContatoEmergencia: '',
  hospitalEmergencia: 'Hospital da Criança',
  neurodivergente: true,
  pcd: false,
  alergicaMedicamento: null,
  alergicaAlimento: null,
  doencaCongenita: null,
  fumante: null,
  caxumba: null,
};

const TIPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENEROS = ['Masculino', 'Feminino', 'Não-binário', 'Prefiro não informar'];

// ─── Sub-components ───────────────────────────────────────

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.subHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
      <Text style={styles.subHeaderTitle}>{title}</Text>
      <View style={{ width: 32 }} />
    </View>
  );
}

function TableRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.tableRow, !last && styles.tableRowBorder]}>
      <Text style={styles.tableLabel}>{label}</Text>
      <Text style={styles.tableValue}>{value || '---'}</Text>
    </View>
  );
}

function FormField({ label, value, onChangeText, placeholder, required }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label}{required && <Text style={styles.fieldRequired}> *</Text>}
      </Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Escreva aqui...'}
        placeholderTextColor={colors.gray[400]}
      />
    </View>
  );
}

function SelectField({ label, value, options, onSelect }: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}{<Text style={styles.fieldRequired}> *</Text>}</Text>
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text style={[styles.selectText, !value && styles.selectPlaceholder]}>
          {value || 'Selecione'}
        </Text>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M6 9l6 6 6-6" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
      {open && (
        <View style={styles.selectOptions}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.selectOption}
              onPress={() => { onSelect(opt); setOpen(false); }}
            >
              <Text style={[styles.selectOptionText, opt === value && styles.selectOptionActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function BottomActions({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return (
    <View style={styles.bottomActions}>
      <Button label="Cancelar" variant="secondary-gray" onPress={onCancel} style={{ flex: 1 }} />
      <Button
        label="Salvar"
        onPress={onSave}
        style={{ flex: 1 }}
        leftIcon={
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M17 21v-8H7v8M7 3v5h8M5 3h11l3 3v13a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke={colors.base.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        }
      />
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────

export default function DadosScreen() {
  const router = useRouter();
  const { setHideHeader, activeStudent, setActiveStudent } = useApp();
  const [viewState, setViewState] = useState<ViewState>('home');

  const activePhoto = activeStudent.foto ?? STUDENT_PHOTOS[activeStudent.iniciais];

  const [basicas, setBasicas] = useState<InfoBasicas>({ ...INITIAL_BASICAS, nome: activeStudent.nome });
  const [editBasicas, setEditBasicas] = useState<InfoBasicas>({ ...INITIAL_BASICAS, nome: activeStudent.nome });

  const [medica, setMedica] = useState<FichaMedica>(INITIAL_MEDICA);
  const [editMedica, setEditMedica] = useState<FichaMedica>(INITIAL_MEDICA);

  useEffect(() => {
    setHideHeader(true);
  }, []);

  useEffect(() => () => { setHideHeader(false); }, []);

  // ── Home ──
  if (viewState === 'home') {
    return (
      <View style={styles.containerDetail}>
        {/* Sub-header */}
        <SubHeader title="Dados do Aluno" onBack={() => router.back()} />

        <View style={styles.detailBody}>
        <View style={styles.whiteCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Info */}
          <View style={styles.profileInfo}>
            <View style={styles.profileRow}>
              <LinearGradient
                colors={gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileAvatarBorder}
              >
                <Image source={activePhoto} style={styles.profileAvatarImage} />
              </LinearGradient>
              <View style={styles.profileTextGroup}>
                <Text style={styles.profileName}>{basicas.nome}</Text>
                <View style={styles.badgesRow}>
                  <View style={styles.badgeBlue}>
                    <Text style={styles.badgeBlueText}>Turma A</Text>
                  </View>
                  {medica.neurodivergente && (
                    <View style={styles.badgeViolet}>
                      <Text style={styles.badgeVioletText}>Neurodivergente</Text>
                    </View>
                  )}
                  {medica.pcd && (
                    <View style={styles.badgeOrange}>
                      <Text style={styles.badgeOrangeText}>PCD</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Menu items */}
          <View style={styles.menuList}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setViewState('basicas')}
              activeOpacity={0.8}
            >
              <Text style={styles.menuItemText}>Informações básicas</Text>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M9 18l6-6-6-6" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setViewState('medica')}
              activeOpacity={0.8}
            >
              <Text style={styles.menuItemText}>Ficha médica</Text>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M9 18l6-6-6-6" stroke={colors.gray[400]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
        </ScrollView>
        </View>
        </View>
      </View>
    );
  }

  // ── Informações básicas ──
  if (viewState === 'basicas') {
    return (
      <View style={styles.containerDetail}>
        <SubHeader title="Informações básicas" onBack={() => setViewState('home')} />
        <View style={styles.detailBody}>
        <View style={styles.whiteCard}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.table}>
            <TableRow label="Nome do aluno" value={basicas.nome} />
            <TableRow label="CPF" value={basicas.cpf} />
            <TableRow label="Data de Nascimento" value={basicas.dataNascimento} />
            <TableRow label="Gênero" value={basicas.genero} />
            <TableRow label="Matrícula" value={basicas.matricula} />
            <TableRow label="Data de Matrícula" value={basicas.dataMatricula} last />
          </View>
        </ScrollView>
        <View style={styles.singleAction}>
          <Button
            label="Editar informações"
            variant="secondary"
            onPress={() => { setEditBasicas({ ...basicas }); setViewState('basicas-edit'); }}
            leftIcon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={colors.brand[600]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            }
          />
        </View>
        </View>
        </View>
      </View>
    );
  }

  // ── Editar informações básicas ──
  if (viewState === 'basicas-edit') {
    return (
      <View style={styles.containerDetail}>
        <View style={styles.editHeader}>
          <Text style={styles.editHeaderTitle}>Editar informações do aluno</Text>
        </View>
        <View style={styles.detailBody}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            <FormField
              label="Nome do Aluno"
              value={editBasicas.nome}
              onChangeText={(v) => setEditBasicas({ ...editBasicas, nome: v })}
              required
            />
            <FormField
              label="CPF"
              value={editBasicas.cpf}
              onChangeText={(v) => setEditBasicas({ ...editBasicas, cpf: v })}
              required
            />
            <FormField
              label="Data de nascimento"
              value={editBasicas.dataNascimento}
              onChangeText={(v) => setEditBasicas({ ...editBasicas, dataNascimento: v })}
              required
            />
            <SelectField
              label="Gênero"
              value={editBasicas.genero}
              options={GENEROS}
              onSelect={(v) => setEditBasicas({ ...editBasicas, genero: v })}
            />
          </View>
        </ScrollView>
        <BottomActions
          onCancel={() => setViewState('basicas')}
          onSave={() => { setBasicas({ ...editBasicas }); setActiveStudent({ ...activeStudent, nome: editBasicas.nome }); setViewState('basicas'); }}
        />
        </View>
      </View>
    );
  }

  // ── Ficha médica ──
  if (viewState === 'medica') {
    return (
      <View style={styles.containerDetail}>
        <SubHeader title="Ficha médica" onBack={() => setViewState('home')} />
        <View style={styles.detailBody}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.table}>
            <TableRow label="Altura (m)" value={medica.altura} />
            <TableRow label="Peso (kg)" value={medica.peso} />
            <TableRow label="Tipo Sanguíneo" value={medica.tipoSanguineo} />
            <TableRow label="Número da Carteira do SUS" value={medica.carteiraSUS} />
            <TableRow label="Contato de Emergência" value={medica.contatoEmergencia} />
            <TableRow label="Hospital de Emergência" value={medica.hospitalEmergencia} />
            <TableRow label="Pessoa com Neurodivergência?" value={medica.neurodivergente ? 'Sim' : 'Não'} />
            <TableRow label="Pessoa com Deficiência (PCD)?" value={medica.pcd ? 'Sim' : 'Não'} />
            <TableRow label="O aluno é alérgico a algum medicamento?" value={medica.alergicaMedicamento ?? '---'} />
            <TableRow label="O aluno é alérgico a algum alimento?" value={medica.alergicaAlimento ?? '---'} />
            <TableRow label="O aluno possui doença congênita?" value={medica.doencaCongenita ?? '---'} />
            <TableRow label="O aluno é fumante?" value={medica.fumante ?? '---'} />
            <TableRow label="O aluno já contraiu caxumba?" value={medica.caxumba ?? '---'} last />
          </View>
        </ScrollView>
        <View style={styles.singleAction}>
          <Button
            label="Editar"
            variant="secondary"
            onPress={() => { setEditMedica({ ...medica }); setViewState('medica-edit'); }}
            leftIcon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={colors.brand[600]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            }
          />
        </View>
        </View>
      </View>
    );
  }

  // ── Editar ficha médica ──
  return (
    <View style={styles.containerDetail}>
      <View style={styles.editHeader}>
        <Text style={styles.editHeaderTitle}>Editar ficha médica</Text>
      </View>
      <View style={styles.detailBody}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <FormField
            label="Altura (m)"
            value={editMedica.altura}
            onChangeText={(v) => setEditMedica({ ...editMedica, altura: v })}
          />
          <FormField
            label="Peso (kg)"
            value={editMedica.peso}
            onChangeText={(v) => setEditMedica({ ...editMedica, peso: v })}
          />
          <SelectField
            label="Tipo Sanguíneo"
            value={editMedica.tipoSanguineo}
            options={TIPOS_SANGUINEOS}
            onSelect={(v) => setEditMedica({ ...editMedica, tipoSanguineo: v })}
          />
          <FormField
            label="Número da Carteira do SUS"
            value={editMedica.carteiraSUS}
            onChangeText={(v) => setEditMedica({ ...editMedica, carteiraSUS: v })}
          />
          <FormField
            label="Contato de Emergência"
            value={editMedica.contatoEmergencia}
            onChangeText={(v) => setEditMedica({ ...editMedica, contatoEmergencia: v })}
            placeholder="(00) 00000-0000"
          />
          <FormField
            label="Nome do Contato de Emergência"
            value={editMedica.nomeContatoEmergencia}
            onChangeText={(v) => setEditMedica({ ...editMedica, nomeContatoEmergencia: v })}
            placeholder="(00) 00000-0000"
          />
          <FormField
            label="Hospital de Emergência"
            value={editMedica.hospitalEmergencia}
            onChangeText={(v) => setEditMedica({ ...editMedica, hospitalEmergencia: v })}
            placeholder="(00) 00000-0000"
          />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Pessoa com Neurodivergência</Text>
            <Switch
              value={editMedica.neurodivergente}
              onValueChange={(v) => setEditMedica({ ...editMedica, neurodivergente: v })}
              trackColor={{ false: colors.gray[200], true: colors.brand[500] }}
              thumbColor={colors.base.white}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Pessoa com Deficiência (PCD)</Text>
            <Switch
              value={editMedica.pcd}
              onValueChange={(v) => setEditMedica({ ...editMedica, pcd: v })}
              trackColor={{ false: colors.gray[200], true: colors.brand[500] }}
              thumbColor={colors.base.white}
            />
          </View>
        </View>
      </ScrollView>
      <BottomActions
        onCancel={() => setViewState('medica')}
        onSave={() => { setMedica({ ...editMedica }); setViewState('medica'); }}
      />
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden',
  },
  containerDetail: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden',
  },
  detailBody: {
    flex: 1,
    backgroundColor: colors.base.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
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

  // Edit header (centered title only)
  editHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.gray[100],
  },
  editHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
  },

  // Profile info
  profileInfo: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: colors.base.white,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileAvatarBorder: {
    borderRadius: 16,
    padding: 3,
    flexShrink: 0,
  },
  profileAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 13,
  },
  profileTextGroup: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badgeBlue: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.blue[200],
    backgroundColor: colors.blueLight[50],
  },
  badgeBlueText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.blue[700],
  },
  badgeViolet: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.violet[200],
    backgroundColor: colors.violet[50],
  },
  badgeVioletText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.violet[700],
  },
  badgeOrange: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.orange[200],
    backgroundColor: colors.orange[50],
  },
  badgeOrangeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.orange[700],
  },

  // Menu list
  menuList: {
    margin: 16,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.base.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[800],
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.gray[300],
    marginHorizontal: 0,
  },

  // Scroll content
  scrollContent: {
    padding: 16,
    gap: 12,
  },

  // Table
  table: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tableLabel: {
    fontSize: 16,
    color: colors.gray[500],
    flex: 1,
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[800],
    textAlign: 'right',
    flex: 1,
  },

  // Single action bar
  singleAction: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: colors.base.white,
  },
  editOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.brand[300],
  },
  editOutlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand[600],
  },

  // Form card
  formCard: {
    backgroundColor: colors.base.white,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[700],
  },
  fieldRequired: {
    color: colors.brand[600],
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.gray[900],
    backgroundColor: colors.base.white,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.base.white,
  },
  selectText: {
    fontSize: 14,
    color: colors.gray[900],
  },
  selectPlaceholder: {
    color: colors.gray[400],
  },
  selectOptions: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 2,
  },
  selectOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  selectOptionText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  selectOptionActive: {
    color: colors.brand[700],
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 14,
    color: colors.gray[800],
    flex: 1,
  },

  // Bottom actions (edit screens)
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: colors.base.white,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.error[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error[600],
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.brand[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.base.white,
  },
});
