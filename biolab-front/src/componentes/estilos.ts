import { keyframes } from '@emotion/react';

// ----------------------------------------------------------------------
// Colores y animaciones compartidas de Biolab.
// La paleta también está en src/theme/theme-config.ts (primary = verde, secondary = tinto);
// aquí van los tonos pastel que MUI no trae por defecto.
// ----------------------------------------------------------------------

export const colores = {
  bosque: '#122A0E',
  verde: '#41553E',
  verdeClaro: '#7E9A6A',
  salvia: '#B9C4A0',
  salviaClara: '#D5DCC6',
  menta: '#DDE4CC',
  crema: '#FFFEF8',
  papel: '#F4F2E4',
  papelOscuro: '#EDEBDD',
  tinto: '#671B1C',
  tintoClaro: '#854949',
  rosa: '#EBD9D5',
  durazno: '#F2E2D2',
  mandarina: '#E8964A',
  mandarinaOscura: '#C27536',
  cafeTexto: '#7A3F22',
  arena: '#E3B98C',
} as const;

/** Tipografía de títulos (serif amigable) y de texto */
export const fuenteTitulos = "'Fraunces Variable', Georgia, serif";
export const fuenteTexto = "'Nunito Variable', system-ui, sans-serif";

export const sombraSuave = '0 1px 0 rgba(18,42,14,.05), 0 14px 30px -16px rgba(18,42,14,.3)';
export const sombraFlotante = '0 18px 40px -16px rgba(18,42,14,.5)';

/** Fondo de "cuaderno de laboratorio" con puntitos */
export const fondoCuaderno = {
  backgroundColor: colores.papel,
  backgroundImage: 'radial-gradient(#D9DDC8 1.4px, transparent 1.6px)',
  backgroundSize: '22px 22px',
};

// ---------------------------- Animaciones ----------------------------

export const flotar = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

export const parpadear = keyframes`
  0%, 91%, 100% { transform: scaleY(1); }
  94% { transform: scaleY(0.1); }
`;

export const bambolear = keyframes`
  0%, 100% { transform: rotate(-7deg); }
  50% { transform: rotate(7deg); }
`;

export const moverOrejas = keyframes`
  0%, 84%, 100% { transform: rotate(0); }
  89% { transform: rotate(-16deg); }
  94% { transform: rotate(8deg); }
`;

export const aparecer = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
`;

export const brincar = keyframes`
  0% { opacity: 0; transform: scale(0.6); }
  70% { opacity: 1; transform: scale(1.06); }
  100% { opacity: 1; transform: scale(1); }
`;

export const caer = keyframes`
  0% { opacity: 0; transform: translateY(-24px); }
  60% { opacity: 1; transform: translateY(3px); }
  100% { opacity: 1; transform: none; }
`;

export const flama = keyframes`
  0%, 100% { transform: scale(1) rotate(-3deg); }
  50% { transform: scale(1.14) rotate(3deg); }
`;

export const dibujarTrazo = keyframes`
  from { stroke-dashoffset: 320; }
  to { stroke-dashoffset: 0; }
`;

export const crecerX = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

export const crecerY = keyframes`
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
`;

export const vapor = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  35% { opacity: 0.9; }
  100% { opacity: 0; transform: translateY(-24px); }
`;

export const sello = keyframes`
  0% { opacity: 0; transform: scale(1.8) rotate(-14deg); }
  60% { opacity: 1; transform: scale(0.94) rotate(-6deg); }
  100% { opacity: 1; transform: scale(1) rotate(-6deg); }
`;

export const confeti = keyframes`
  0% { opacity: 0; transform: translateY(16px) scale(0.4); }
  25% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-80px) rotate(220deg); }
`;

export const escanear = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(228px); }
`;

export const caminar = keyframes`
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50% { transform: translateY(-6px) rotate(4deg); }
`;

export const burbuja = keyframes`
  0% { opacity: 0; transform: translateY(0); }
  30% { opacity: 0.9; }
  100% { opacity: 0; transform: translateY(-26px); }
`;

/** sx para que un bloque aparezca desde abajo, con retraso opcional en segundos */
export const sxAparecer = (retraso = 0) => ({
  animation: `${aparecer} .6s cubic-bezier(.2,.8,.2,1) ${retraso}s both`,
});

/** sx para tarjetas que se levantan al pasar el mouse */
export const sxLevantar = {
  transition: 'transform .22s ease, box-shadow .22s ease',
  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 22px 38px -18px rgba(18,42,14,.45)' },
};

/** sx para respetar a quien pide menos movimiento */
export const sxSinMovimiento = {
  '@media (prefers-reduced-motion: reduce)': {
    '&, & *': { animation: 'none !important', transition: 'none !important' },
  },
};
