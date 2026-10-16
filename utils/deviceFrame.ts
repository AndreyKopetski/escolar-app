import { Platform } from 'react-native';

/** Nome do <iframe> do mockup. `window.name` sobrevive a reloads dentro do
    iframe (inclusive o reload do dev server), ao contrário de uma query. */
export const FRAME_NAME = 'escolar-device-frame';
/** Mensagem que o app dentro do mockup manda para a janela externa a cada navegação. */
export const ROUTE_MESSAGE = 'escolar:route';

// Janela "de desktop": larga e alta o bastante para o celular fazer sentido.
const MIN_W = 600;
const MIN_H = 700;

/** O app está rodando dentro do iframe do mockup. */
export const isInDeviceFrame =
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  window.self !== window.top &&
  window.name === FRAME_NAME;

/** A janela externa deve mostrar o mockup em vez do app. Nunca é true dentro
    do próprio iframe (sem recursão). */
export function shouldShowDeviceFrame() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  if (window.self !== window.top) return false;
  return window.innerWidth >= MIN_W && window.innerHeight >= MIN_H;
}

/** Áreas seguras do iPhone 16: status bar + Dynamic Island em cima, indicador
    de home embaixo. No iframe o navegador reporta 0, então o app recebe estas. */
export const DEVICE_FRAME_INSETS = { top: 54, bottom: 34, left: 0, right: 0 };
