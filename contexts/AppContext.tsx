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

export type UserRole = 'responsavel' | 'gestor' | 'equipe' | null;

type AppContextType = {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
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
  profilePhoto: number | null;
  setProfilePhoto: (photo: number | null) => void;
  language: 'es' | 'pt' | 'en';
  setLanguage: (lang: 'es' | 'pt' | 'en') => void;
  hasBiometric: boolean;
  setHasBiometric: (v: boolean) => void;
  unreadNotificationsCount: number;
  setUnreadNotificationsCount: (n: number) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [displayName, setDisplayName] = useState('Usuário');
  const [userEmail, setUserEmail] = useState('');
  const [activeStudent, setActiveStudent] = useState<Aluno>(DEFAULT_STUDENT);
  const [activeYear, setActiveYear] = useState('2026');
  const [isStudentSheetVisible, setStudentSheetVisible] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [isProfileSheetVisible, setProfileSheetVisible] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(4);
  const [profilePhoto, setProfilePhoto] = useState<number | null>(null);
  const [language, setLanguage] = useState<'es' | 'pt' | 'en'>('es');

  return (
    <AppContext.Provider value={{
      userRole, setUserRole,
      displayName, setDisplayName,
      userEmail, setUserEmail,
      activeStudent, setActiveStudent,
      activeYear, setActiveYear,
      isStudentSheetVisible, setStudentSheetVisible,
      hideHeader, setHideHeader,
      isProfileSheetVisible, setProfileSheetVisible,
      profilePhoto, setProfilePhoto,
      language, setLanguage,
      hasBiometric, setHasBiometric,
      unreadNotificationsCount, setUnreadNotificationsCount,
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
