# EscolarAI

Portal escolar mobile para alunos e responsáveis, desenvolvido com React Native e Expo.

## Sobre o Projeto

EscolarAI é um aplicativo multiplataforma (iOS, Android e Web) que centraliza informações escolares do aluno em um único lugar: notas, frequência, agenda, cardápio, biblioteca e muito mais.

## Funcionalidades

- **Boletim** — Notas por bimestre, médias e detalhes de avaliações
- **Diário** — Registro de ocorrências, méritos e advertências
- **Agenda** — Grade de aulas por dia da semana
- **Histórico** — Acompanhamento de frequência e faltas
- **Merenda** — Cardápio mensal com informações nutricionais
- **Livros** — Controle de empréstimos da biblioteca
- **Material** — Lista de materiais escolares
- **Dados** — Perfil do aluno, contatos e informações de saúde

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Expo ~55.0.8 |
| UI | React 19.2.0 + React Native 0.83.2 |
| Linguagem | TypeScript ~5.9.2 |
| Navegação | Expo Router ~55.0.7 |
| Animações | React Native Reanimated 4.2.1 |
| Web | React Native Web ^0.21.0 |

## Estrutura do Projeto

```
escolarai-app/
├── app/
│   ├── index.tsx          # Splash screen
│   ├── welcome.tsx        # Tela de boas-vindas
│   ├── login.tsx          # Login
│   ├── _layout.tsx        # Layout raiz
│   └── (main)/            # Telas principais
│       ├── boletim.tsx
│       ├── diario.tsx
│       ├── agenda.tsx
│       ├── historico.tsx
│       ├── merenda.tsx
│       ├── livros.tsx
│       ├── material.tsx
│       └── dados.tsx
├── components/            # Componentes reutilizáveis
├── contexts/              # Estado global (AppContext)
├── constants/             # Cores e mock data
└── assets/                # Imagens e ícones
```

## Como Rodar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Para iOS: Xcode (macOS) ou Expo Go
- Para Android: Android Studio ou Expo Go

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd escolarai-app

# Instale as dependências
npm install
```

### Executar

```bash
# Servidor de desenvolvimento
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Configuração de Ambiente

O projeto utiliza configuração padrão do Expo. As variáveis de ambiente podem ser definidas em arquivos `.env` na raiz do projeto (não versionados).

## Estado Atual

O projeto utiliza dados mock para desenvolvimento. As chamadas de API reais devem substituir os dados em `constants/mockData.ts` e nos arquivos de tela conforme o backend for integrado.
