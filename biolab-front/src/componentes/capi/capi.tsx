import type { IdRecompensa } from 'src/tipos/dominio';
import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';

import { flotar, bambolear, parpadear, moverOrejas } from '../estilos';

// ----------------------------------------------------------------------
// Capi: la capibara mascota de Biolab, dibujada de perfil.
//   animo        feliz | triste | celebrando
//   accesorios   lo que trae puesto (mandarina, lentes, bata…)
//   mirarDerecha voltea el dibujo (útil cuando camina hacia la derecha)
// ----------------------------------------------------------------------

export type AnimoDibujo = 'feliz' | 'triste' | 'celebrando';

export type CapiProps = {
  animo?: AnimoDibujo;
  ancho?: number;
  accesorios?: Partial<Record<IdRecompensa, boolean>>;
  flotando?: boolean;
  mirarDerecha?: boolean;
  etiqueta?: string;
  sx?: SxProps<Theme>;
};

const ALTO_POR_ANCHO = 106 / 140;

export function Capi({
  animo = 'feliz',
  ancho = 96,
  accesorios = { mandarina: true },
  flotando = false,
  mirarDerecha = false,
  etiqueta,
  sx,
}: CapiProps) {
  const triste = animo === 'triste';
  const colores = triste
    ? { pata: '#7E6656', pataAtras: '#6E5A4C', cuerpo: '#957C6A', cabeza: '#A08672', nariz: '#5E4A3E', oreja: '#6E5A4C' }
    : { pata: '#8E5A36', pataAtras: '#7A4B2E', cuerpo: '#A86F45', cabeza: '#B57B4E', nariz: '#6B4129', oreja: '#7A4B2E' };

  return (
    <Box
      component="svg"
      viewBox="0 -6 140 106"
      width={ancho}
      height={Math.round(ancho * ALTO_POR_ANCHO)}
      role={etiqueta ? 'img' : undefined}
      aria-label={etiqueta}
      aria-hidden={etiqueta ? undefined : true}
      sx={[
        {
          display: 'block',
          overflow: 'visible',
          ...(mirarDerecha && { transform: 'scaleX(-1)' }),
          ...(flotando && { animation: `${flotar} 3.2s ease-in-out infinite` }),
          '& .capi-ojo': { animation: `${parpadear} 4.6s infinite`, transformBox: 'fill-box', transformOrigin: 'center' },
          '& .capi-oreja': { animation: `${moverOrejas} 5.5s infinite`, transformBox: 'fill-box', transformOrigin: '50% 100%' },
          '& .capi-mandarina': { animation: `${bambolear} 2.8s ease-in-out infinite`, transformBox: 'fill-box', transformOrigin: '50% 100%' },
          '@media (prefers-reduced-motion: reduce)': { '&, & *': { animation: 'none !important' } },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* Patas */}
      <rect x="56" y="74" width="11" height="20" rx="5" fill={colores.pata} />
      <rect x="72" y="76" width="11" height="18" rx="5" fill={colores.pataAtras} />
      <rect x="104" y="74" width="12" height="20" rx="5" fill={colores.pata} />
      <rect x="119" y="72" width="11" height="20" rx="5" fill={colores.pataAtras} />

      {/* Cuerpo */}
      <path d="M60 30H110C124 30 134 42 134 58C134 74 124 84 110 84H64C54 84 48 76 48 66V42C48 35 53 30 60 30Z" fill={colores.cuerpo} />
      {!triste && (
        <path
          d="M78 36q14-4 30 0M88 44q10-3 20 0M104 52q8-2 16 0"
          fill="none"
          stroke="#8E5A36"
          strokeWidth="2"
          strokeLinecap="round"
          opacity=".7"
        />
      )}

      {/* Bata (encima del cuerpo, detrás de la cabeza) */}
      {accesorios.bata && (
        <g>
          <path d="M72 31H110C124 31 133 42 134 56V84H76C73 84 72 81 72 78Z" fill="#FFFEF8" />
          <path d="M74 31L84 47L94 31" fill="none" stroke="#B9C4A0" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M84 47V84" stroke="#D5DCC6" strokeWidth="2" />
          <rect x="96" y="60" width="11" height="9" rx="2" fill="none" stroke="#B9C4A0" strokeWidth="2" />
          <path d="M99 60v-6" stroke="#854949" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}

      {/* Oreja */}
      {triste ? (
        <ellipse cx="63" cy="19" rx="7" ry="4" fill={colores.oreja} transform="rotate(35 63 19)" />
      ) : (
        <ellipse className="capi-oreja" cx="60" cy="15" rx="6" ry="5.5" fill={colores.oreja} />
      )}

      {/* Cabeza: larga y cuadrada, con la nariz oscura al frente */}
      <path d="M28 16H56C66 16 72 23 72 33V56C72 63 67 68 60 68H20C11 68 5 61 5 52V36C5 25 15 16 28 16Z" fill={colores.cabeza} />
      <path d="M5 36C5 30 9 27 14 27H19V55H13C8 55 5 51 5 46Z" fill={colores.nariz} />
      <ellipse cx="11" cy="35" rx="2" ry="3" fill="#2B1B10" />

      {/* Cara según el ánimo */}
      {animo === 'feliz' && (
        <g>
          <ellipse className="capi-ojo" cx="42" cy="31" rx="3" ry="3.6" fill="#2B1B10" />
          <circle cx="43.2" cy="29.6" r="1" fill="#FFFEF8" />
          <path d="M8 60q6 3 12 0" fill="none" stroke="#4A2E1E" strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="34" cy="47" rx="6" ry="3.2" fill="#E59C97" opacity=".75" />
        </g>
      )}
      {animo === 'celebrando' && (
        <g>
          <path d="M37 32q5-6 10 0" fill="none" stroke="#2B1B10" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M7 58q7 8 14 0z" fill="#8A3B33" />
          <ellipse cx="34" cy="47" rx="6" ry="3.2" fill="#E59C97" opacity=".75" />
        </g>
      )}
      {triste && (
        <g>
          <path d="M36 25l10 3" stroke="#3A2A20" strokeWidth="2.4" strokeLinecap="round" />
          <path className="capi-ojo" d="M38 33q4 3 8 0" fill="none" stroke="#2B1B10" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M41 37q-2.5 5 0 7q2.5-2 0-7z" fill="#8FBCD4" />
          <path d="M8 62q6-3 12 0" fill="none" stroke="#4A2E1E" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}

      {/* Lentes de seguridad */}
      {accesorios.lentes && (
        <g>
          <path d="M53 31H71" stroke="#41553E" strokeWidth="3" strokeLinecap="round" />
          <rect x="31" y="23" width="22" height="16" rx="7" fill="#CFE6EE" fillOpacity=".45" stroke="#41553E" strokeWidth="3" />
          <path d="M35 27l5-2" stroke="#FFFEF8" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* Mandarina: en la cabeza si está feliz, en el suelo si está triste */}
      {accesorios.mandarina && !triste && (
        <g className="capi-mandarina">
          <circle cx="40" cy="8" r="8.5" fill="#E8964A" />
          <path d="M40 0q6-6 11-2q-5 4-11 2z" fill="#41553E" />
        </g>
      )}
      {accesorios.mandarina && triste && (
        <g>
          <circle cx="133" cy="93" r="6" fill="#E8964A" />
          <path d="M133 87q4-4 8-1q-4 3-8 1z" fill="#41553E" />
        </g>
      )}
    </Box>
  );
}
