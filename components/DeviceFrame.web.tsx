import { useEffect, useState } from 'react';
import { FRAME_NAME, ROUTE_MESSAGE } from '@/utils/deviceFrame';

// Viewport do iPhone 16 (pontos CSS) e medidas da moldura.
const SCREEN_W = 393;
const SCREEN_H = 852;
const BEZEL = 12;
const PHONE_W = SCREEN_W + BEZEL * 2;
const PHONE_H = SCREEN_H + BEZEL * 2;
const MARGIN = 32; // respiro mínimo entre o celular e a borda da janela

function fitScale() {
  return Math.min(1, (window.innerHeight - MARGIN * 2) / PHONE_H, (window.innerWidth - MARGIN * 2) / PHONE_W);
}

/* Mockup de iPhone 16 só para o navegador desktop. O app roda inteiro dentro
   do <iframe> (393x852): lá dentro Dimensions, Modals e safe-area se comportam
   como num celular, o que um wrapper de largura fixa não garantiria. O iframe
   recebe a rota aberta na janela externa e devolve a navegação por
   postMessage, para a URL de fora acompanhar (refresh mantém a tela). */
export default function DeviceFrame() {
  // Lido uma vez: a URL externa muda depois (replaceState), o src não.
  const [src] = useState(() => window.location.pathname + window.location.search + window.location.hash);
  const [scale, setScale] = useState(fitScale);

  useEffect(() => {
    const onResize = () => setScale(fitScale());
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const data = e.data as { type?: string; path?: string } | null;
      if (data?.type === ROUTE_MESSAGE && typeof data.path === 'string' && data.path.startsWith('/')) {
        window.history.replaceState(window.history.state, '', data.path);
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return (
    <div style={styles.page}>
      <div style={{ ...styles.phone, transform: `scale(${scale})` }}>
        {/* Botões laterais: ação + volume à esquerda, power + câmera à direita */}
        <span style={{ ...styles.button, left: -3, top: 150, height: 32 }} />
        <span style={{ ...styles.button, left: -3, top: 215, height: 62 }} />
        <span style={{ ...styles.button, left: -3, top: 290, height: 62 }} />
        <span style={{ ...styles.button, right: -3, top: 245, height: 96 }} />
        <span style={{ ...styles.button, right: -3, top: 520, height: 70, width: 2, opacity: 0.6 }} />

        <div style={styles.screen}>
          <iframe name={FRAME_NAME} src={src} title="Escolar Ai" style={styles.iframe} />
          <StatusBar />
          <div aria-hidden style={styles.island} />
          <div aria-hidden style={styles.homeIndicator} />
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div aria-hidden style={styles.statusBar}>
      <span style={styles.time}>9:41</span>
      <span style={styles.icons}>
        {/* Sinal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="#000">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* Wi-fi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="#000">
          <path d="M8.5 2.3c2.3 0 4.4.9 6 2.4l1.2-1.2A10.2 10.2 0 0 0 8.5.6 10.2 10.2 0 0 0 1.3 3.5l1.2 1.2c1.6-1.5 3.7-2.4 6-2.4Z" />
          <path d="M8.5 5.7c1.4 0 2.6.5 3.6 1.4l1.2-1.2a6.8 6.8 0 0 0-9.6 0l1.2 1.2c1-.9 2.2-1.4 3.6-1.4Z" />
          <path d="M8.5 9c.5 0 1 .2 1.3.5L8.5 11.8 7.2 9.5c.3-.3.8-.5 1.3-.5Z" />
        </svg>
        {/* Bateria */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="22" height="12" rx="3.8" stroke="#000" strokeOpacity="0.35" />
          <rect x="2" y="2" width="19" height="9" rx="2.5" fill="#000" />
          <path d="M24 4.5v4c.8-.3 1.5-1.1 1.5-2s-.7-1.7-1.5-2Z" fill="#000" fillOpacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Neutro claro com um toque bem dessaturado do verde da marca (#00E554).
    background: 'radial-gradient(120% 90% at 50% 0%, #EAF5EE 0%, #F2F4F7 55%, #ECEEF2 100%)',
  },
  phone: {
    position: 'relative',
    flexShrink: 0,
    width: PHONE_W,
    height: PHONE_H,
    padding: BEZEL,
    boxSizing: 'border-box',
    borderRadius: 55,
    // Titânio escuro: moldura em degradê + aro fino mais claro.
    background: 'linear-gradient(145deg, #3A3B3F 0%, #1B1C1F 45%, #2A2B2F 100%)',
    boxShadow:
      'inset 0 0 0 1.5px rgba(255,255,255,0.14), inset 0 0 0 4px #0B0B0C, 0 30px 70px -20px rgba(16,24,40,0.45), 0 12px 24px -12px rgba(16,24,40,0.3)',
    transformOrigin: 'center center',
  },
  button: {
    position: 'absolute',
    width: 3,
    borderRadius: 2,
    background: 'linear-gradient(90deg, #2A2B2F, #4A4B50)',
  },
  screen: {
    position: 'relative',
    width: SCREEN_W,
    height: SCREEN_H,
    borderRadius: 47,
    overflow: 'hidden',
    background: '#fff',
    // Recorte arredondado também para o conteúdo do iframe (Safari/Chrome).
    isolation: 'isolate',
  },
  iframe: {
    display: 'block',
    width: SCREEN_W,
    height: SCREEN_H,
    border: 0,
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 54,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 30px 0 44px',
    boxSizing: 'border-box',
    pointerEvents: 'none',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  },
  time: { fontSize: 17, fontWeight: 600, color: '#000', letterSpacing: -0.2 },
  icons: { display: 'flex', alignItems: 'center', gap: 6 },
  island: {
    position: 'absolute',
    top: 11,
    left: '50%',
    width: 126,
    height: 37,
    marginLeft: -63,
    borderRadius: 20,
    background: '#000',
    pointerEvents: 'none',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    width: 134,
    height: 5,
    marginLeft: -67,
    borderRadius: 3,
    background: '#000',
    pointerEvents: 'none',
  },
};
