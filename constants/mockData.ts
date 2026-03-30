export type Student = {
  id: string;
  initials: string;
  initialsColor: string;
  name: string;
  grade: string;
  class: string;
};

export type Discipline = {
  id: string;
  name: string;
  grade: number | null;
};

export type BimesterData = {
  label: string;
  disciplines: Discipline[];
};

export const MOCK_USER = {
  name: 'Brennon',
  avatarUrl: null as string | null,
};

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    initials: 'TK',
    initialsColor: '#6B7280',
    name: 'Thomas Vrisman Kopetski',
    grade: '9 Ano A',
    class: 'Ensino Fundamental II',
  },
  {
    id: '2',
    initials: 'OR',
    initialsColor: '#F59E0B',
    name: 'Júlia Vrisman Kopetski',
    grade: '6 Ano A',
    class: 'Ensino Fundamental II',
  },
];

export const MOCK_ACTIVE_STUDENT = {
  id: '1',
  name: 'João Oliveira',
};

export const MOCK_BIMESTERS: BimesterData[] = [
  {
    label: '1º Bim',
    disciplines: [
      { id: '1', name: 'Português', grade: 7.0 },
      { id: '2', name: 'Matemática', grade: 5.0 },
      { id: '3', name: 'Ciências', grade: 0.0 },
      { id: '4', name: 'História', grade: 7.0 },
      { id: '5', name: 'Geografia', grade: 5.0 },
      { id: '6', name: 'Artes', grade: 0.0 },
      { id: '7', name: 'Educação Física', grade: 7.0 },
    ],
  },
  {
    label: '2º Bim',
    disciplines: [
      { id: '1', name: 'Português', grade: null },
      { id: '2', name: 'Matemática', grade: null },
      { id: '3', name: 'Ciências', grade: null },
      { id: '4', name: 'História', grade: null },
      { id: '5', name: 'Geografia', grade: null },
      { id: '6', name: 'Artes', grade: null },
      { id: '7', name: 'Educação Física', grade: null },
    ],
  },
  {
    label: '3º Bim',
    disciplines: [
      { id: '1', name: 'Português', grade: null },
      { id: '2', name: 'Matemática', grade: null },
      { id: '3', name: 'Ciências', grade: null },
      { id: '4', name: 'História', grade: null },
      { id: '5', name: 'Geografia', grade: null },
      { id: '6', name: 'Artes', grade: null },
      { id: '7', name: 'Educação Física', grade: null },
    ],
  },
  {
    label: '4º Bim',
    disciplines: [
      { id: '1', name: 'Português', grade: null },
      { id: '2', name: 'Matemática', grade: null },
      { id: '3', name: 'Ciências', grade: null },
      { id: '4', name: 'História', grade: null },
      { id: '5', name: 'Geografia', grade: null },
      { id: '6', name: 'Artes', grade: null },
      { id: '7', name: 'Educação Física', grade: null },
    ],
  },
  {
    label: 'Final',
    disciplines: [
      { id: '1', name: 'Português', grade: null },
      { id: '2', name: 'Matemática', grade: null },
      { id: '3', name: 'Ciências', grade: null },
      { id: '4', name: 'História', grade: null },
      { id: '5', name: 'Geografia', grade: null },
      { id: '6', name: 'Artes', grade: null },
      { id: '7', name: 'Educação Física', grade: null },
    ],
  },
];
