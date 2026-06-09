# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Expo dev server (opens QR code for Expo Go)
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser
npm run build:web  # Export static web build
```

There are no test or lint scripts configured.

## Architecture

### Navigation (Expo Router)

File-based routing via `expo-router`. Two layout levels:

- `app/_layout.tsx` — root Stack, wraps everything in `AppProvider`
- `app/(main)/_layout.tsx` — main group layout; renders `Header` + `Stack` + `Navbar` + two global bottom sheets (`ProfileSheet`, `AlunoSelectSheet`) inside a `SafeAreaView`

Navigation flow: `index.tsx` (animated splash) → `login.tsx` → `welcome.tsx` → `(main)/boletim` (and other tabs).

### Global State (AppContext)

`contexts/AppContext.tsx` holds all shared UI state via React Context:

- `activeStudent` / `setActiveStudent` — currently selected student (`Aluno` type)
- `activeYear` — selected school year string (e.g. `'2026'`)
- `displayName` / `userEmail` — logged-in user info
- `hideHeader` — when `true`, hides both `Header` and `Navbar` (used by the Boletim detail sub-view to take over the full screen)
- `isStudentSheetVisible` / `isProfileSheetVisible` — control the two global bottom sheets

### Navigation Bar

`Navbar` has 4 primary routes (Boletim, Frequência, Aulas, Diário) plus a "Mais" button that opens `MenuSheet`. Secondary screens (Merenda, Livros, Material, Dados) are accessed via `MenuSheet` and show their name in the "Mais" tab slot when active. The active indicator is an animated pill using `react-native-reanimated`.

### Screen Layout Convention

All `(main)` screens render their content inside a white card with `borderTopLeftRadius: 20, borderTopRightRadius: 20` on a `colors.gray[100]` background, creating a layered look beneath the Header.

### Bottom Sheets

Custom animated sheets, not a library. `ProfileSheet` and `AlunoSelectSheet` are always mounted in the main layout and toggled via context flags. Per-screen sheets (e.g. the grade detail sheet in Boletim) use React Native `Modal` + `Animated.Value` with spring/timing animations directly.

### Styling

All styles use `StyleSheet.create`. No UI component library — all icons are inline SVG via `react-native-svg`. The design token system lives in `constants/colors.ts`, which exports a `colors` object (nested scales: `gray`, `brand`, `error`, `warning`, `success`, etc.) and a `gradients` object. Primary brand color: `#00E554` (green).

The `@/` path alias resolves to the project root (configured in `tsconfig.json`).

### Data Layer

All data is currently hardcoded mock data. Screen-level mock data lives inline within each screen file (e.g. `dadosPorBimestre` in `boletim.tsx`). Shared type definitions and smaller datasets are in `constants/mockData.ts`. When integrating a real backend, replace these inline data objects; the context and component structure can remain unchanged.
