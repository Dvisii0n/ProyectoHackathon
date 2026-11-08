import type { Theme, SxProps } from '@mui/material/styles';
import type { IconifyName } from 'src/components/iconify/register-icons';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { colores, confeti, sxAparecer, sombraSuave, dibujarTrazo, fuenteTitulos } from './estilos';

// ----------------------------------------------------------------------
// Piezas pequeñas que se repiten en todas las pantallas.
// ----------------------------------------------------------------------

type EncabezadoPaginaProps = {
  antetitulo: string;
  titulo: string;
  descripcion?: string;
  /** Lo que va a la derecha del título (chip de rol, botones…) */
  accion?: React.ReactNode;
};

/** Título grande con el subrayado que se dibuja solo */
export function EncabezadoPagina({ antetitulo, titulo, descripcion, accion }: EncabezadoPaginaProps) {
  return (
    <Box
      component="header"
      sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mb: 3, ...sxAparecer() }}
    >
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 900, letterSpacing: '.1em', color: colores.tintoClaro }}>
          {antetitulo.toUpperCase()}
        </Typography>
        <Typography
          component="h1"
          sx={{ mt: 0.75, fontFamily: fuenteTitulos, fontWeight: 600, fontSize: { xs: 34, md: 46 }, lineHeight: 1.02, letterSpacing: '-.01em' }}
        >
          {titulo}
        </Typography>
        <Box component="svg" width={230} height={16} viewBox="0 0 230 16" aria-hidden sx={{ display: 'block', mt: 0.5 }}>
          <Box
            component="path"
            d="M3 10c20-9 32 7 54 0s32-9 54 0 32 7 54 0 30-7 62-2"
            fill="none"
            stroke={colores.tintoClaro}
            strokeWidth={4}
            strokeLinecap="round"
            sx={{ strokeDasharray: 320, animation: `${dibujarTrazo} 1.3s .25s ease-out both` }}
          />
        </Box>
        {descripcion && (
          <Typography sx={{ mt: 1, fontSize: 17, fontWeight: 600, color: colores.verde }}>{descripcion}</Typography>
        )}
      </Box>
      {accion}
    </Box>
  );
}

type TarjetaProps = {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  retraso?: number;
};

/** Tarjeta crema con sombra suave (sin bordes duros) */
export function Tarjeta({ children, sx, retraso }: TarjetaProps) {
  return (
    <Box
      sx={[
        { bgcolor: colores.crema, borderRadius: '28px', boxShadow: sombraSuave, p: 3 },
        retraso !== undefined ? sxAparecer(retraso) : {},
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

type ChipEstadoProps = {
  texto: string;
  fondo: string;
  color: string;
  icono?: IconifyName;
};

/** Etiqueta redonda de estado. Siempre lleva texto (y opcionalmente ícono), nunca solo color. */
export function ChipEstado({ texto, fondo, color, icono }: ChipEstadoProps) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        py: 0.75,
        px: 1.5,
        borderRadius: 99,
        fontWeight: 800,
        fontSize: 13,
        whiteSpace: 'nowrap',
        bgcolor: fondo,
        color,
      }}
    >
      {icono && <Iconify icon={icono} width={15} />}
      {texto}
    </Box>
  );
}

/** Círculo con número para los pasos de un formulario */
export function NumeroPaso({ numero }: { numero: number }) {
  return (
    <Box
      component="span"
      sx={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        bgcolor: colores.bosque,
        color: colores.crema,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {numero}
    </Box>
  );
}

/** Confeti que sale de abajo; se pone dentro de un contenedor con position: relative */
export function Confeti() {
  const piezas = [
    { left: '10%', top: '72%', color: colores.tintoClaro, ancho: 12, alto: 12, radio: '3px', retraso: 0 },
    { left: '24%', top: '82%', color: colores.mandarina, ancho: 10, alto: 10, radio: '50%', retraso: 0.3 },
    { left: '40%', top: '76%', color: colores.verde, ancho: 12, alto: 6, radio: '3px', retraso: 0.6 },
    { left: '62%', top: '84%', color: colores.tinto, ancho: 10, alto: 10, radio: '3px', retraso: 0.15 },
    { left: '78%', top: '72%', color: colores.crema, ancho: 12, alto: 12, radio: '50%', retraso: 0.45 },
    { left: '90%', top: '80%', color: colores.mandarina, ancho: 10, alto: 6, radio: '3px', retraso: 0.8 },
  ];

  return (
    <>
      {piezas.map((p, i) => (
        <Box
          key={i}
          aria-hidden
          sx={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.ancho,
            height: p.alto,
            borderRadius: p.radio,
            bgcolor: p.color,
            animation: `${confeti} 1.8s ease-out ${p.retraso}s infinite`,
          }}
        />
      ))}
    </>
  );
}
