import React, { createContext, useContext, useState } from 'react';

export type Aluno = {
  id: string;
  nome: string;
  iniciais: string;
  turma: string;
  nivel: string;
  foto?: number;
};

const DEFAULT_STUDENT: Aluno = {
  id: '1',
  nome: 'Thomas Vrisman Kopetski',
  iniciais: 'TK',
  turma: '9 Ano A',
  nivel: 'Ensino Fundamental II',
  foto: require('@/assets/images/avatar-thomas.jpg'),
};

type AppContextType = {
  displayName: string;
  setDisplayName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  activeStudent: Aluno;
  setActiveStudent: (aluno: Aluno) => void;
  activeYear: string;
  setActiveYear: (year: string) => void;
  isStudentSheetVisible: boolean;
  setStudentSheetVisible: (v: boolean) => void;
  hideHeader: boolean;
  setHideHeader: (v: boolean) => void;
  isProfileSheetVisible: boolean;
  setProfileSheetVisible: (v: boolean) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [displayName, setDisplayName] = useState('Usuário');
  const [userEmail, setUserEmail] = useState('');
  const [activeStudent, setActiveStudent] = useState<Aluno>(DEFAULT_STUDENT);
  const [activeYear, setActiveYear] = useState('2026');
  const [isStudentSheetVisible, setStudentSheetVisible] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [isProfileSheetVisible, setProfileSheetVisible] = useState(false);

  return (
    <AppContext.Provider value={{
      displayName, setDisplayName,
      userEmail, setUserEmail,
      activeStudent, setActiveStudent,
      activeYear, setActiveYear,
      isStudentSheetVisible, setStudentSheetVisible,
      hideHeader, setHideHeader,
      isProfileSheetVisible, setProfileSheetVisible,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
