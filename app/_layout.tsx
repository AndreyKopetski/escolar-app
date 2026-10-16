import { useEffect, useState } from 'react';
import { Stack, usePathname, useGlobalSearchParams } from 'expo-router';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { AppProvider } from '@/contexts/AppContext';
import DeviceFrame from '@/components/DeviceFrame';
import {
  DEVICE_FRAME_INSETS,
  ROUTE_MESSAGE,
  isInDeviceFrame,
  shouldShowDeviceFrame,
} from '@/utils/deviceFrame';

/* Dentro do mockup: avisa a janela externa de cada navegação, para a URL de
   fora acompanhar a tela atual (refresh abre o celular na mesma tela). */
function RouteReporter() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  useEffect(() => {
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v == null) continue;
      for (const item of Array.isArray(v) ? v : [v]) query.append(k, String(item));
    }
    const qs = query.toString();
    window.parent.postMessage({ type: ROUTE_MESSAGE, path: pathname + (qs ? `?${qs}` : '') }, window.location.origin);
  }, [pathname, params]);
  return null;
}

export default function RootLayout() {
  // Web desktop: a página externa mostra só o iPhone com o app num iframe.
  // Reavaliado no resize (janela estreita volta ao app em tela cheia).
  const [framed, setFramed] = useState(shouldShowDeviceFrame);
  useEffect(() => {
    if (isInDeviceFrame || typeof window === 'undefined' || !window.addEventListener) return;
    const onResize = () => setFramed(shouldShowDeviceFrame());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (framed) return <DeviceFrame />;

  const app = (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProvider>
  );

  if (!isInDeviceFrame) return app;

  // No iframe o navegador reporta safe-area 0: o app recebe as do iPhone 16,
  // para o conteúdo não ficar sob a status bar/Dynamic Island nem a navbar
  // sob o indicador de home.
  return (
    <SafeAreaInsetsContext.Provider value={DEVICE_FRAME_INSETS}>
      <RouteReporter />
      {app}
    </SafeAreaInsetsContext.Provider>
  );
}
