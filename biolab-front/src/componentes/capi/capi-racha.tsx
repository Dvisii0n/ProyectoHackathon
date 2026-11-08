import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { obtenerRacha } from 'src/servicios';
import { useSesion } from 'src/contexto/sesion';
import { useDatos } from 'src/ganchos/usar-datos';
import { useMascota } from 'src/contexto/mascota';

import { Iconify } from 'src/components/iconify';

import { Capi } from './capi';
import { flama, crecerX, brincar, colores, fuenteTitulos, sombraFlotante } from '../estilos';

// ----------------------------------------------------------------------
// Racha de Capi fija a la derecha en todas las pantallas (como la racha de TikTok).
// Al tocarla se abre el detalle de la semana; arriba aparece un consejo por pantalla.
// ----------------------------------------------------------------------

const consejosPorRuta: Record<string, string> = {
  '/': 'Tienes reportes esperando. Decidir te toma 2 minutos.',
  '/reportes': 'Un toque por reporte. Si te equivocas, puedes deshacer.',
  '/reportes/nuevo': 'Toca una carita por cada cosa. Capi camina hasta la meta contigo.',
  '/inventario': 'Los tubitos en tinto se están acabando.',
  '/horarios': 'Los recuadros con "+" están libres.',
  '/pedir-material': 'Pide para todo tu equipo. Se abre una semana antes de la práctica.',
  '/practicas': 'Primero registra tus equipos; luego crea la práctica y elige quién la hace.',
  '/mis-practicas': 'Aquí ves las prácticas de tu equipo y cómo va tu material.',
  '/solicitudes': 'Palomea lo que sí prestas. Al equipo le llega un QR de aprobación.',
  '/galeria': 'Toca la mandarina, los lentes o la bata para vestir a Capi.',
};

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const ANCHO_RACHA = 118;

export function CapiRacha() {
  const pathname = usePathname();
  const { rol } = useSesion();
  const { animoSimulado } = useMascota();
  const { datos: racha } = useDatos(() => obtenerRacha(rol), [rol]);

  const [abierta, setAbierta] = useState(false);
  const [consejoCerrado, setConsejoCerrado] = useState<string | null>(null);

  const animo = animoSimulado ?? racha?.animo ?? 'feliz';
  const triste = animo === 'triste';
  const dias = triste ? 0 : (racha?.dias ?? 0);
  const consejo = consejosPorRuta[pathname];
  const mostrarConsejo = !!consejo && consejoCerrado !== pathname && !abierta;

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 1200,
        right: { xs: 12, md: 22 },
        top: { xs: 'auto', md: '50%' },
        bottom: { xs: 14, md: 'auto' },
        transform: { md: 'translateY(-50%)' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1.5,
      }}
    >
      {mostrarConsejo && (
        <Box
          key={pathname}
          sx={{
            position: 'relative',
            maxWidth: 230,
            py: 1.75,
            pl: 2,
            pr: 5,
            borderRadius: '22px 22px 6px 22px',
            bgcolor: colores.crema,
            boxShadow: sombraFlotante,
            typography: 'body2',
            fontWeight: 700,
            animation: `${brincar} .45s cubic-bezier(.2,.8,.2,1) .9s both`,
          }}
        >
          {consejo}
          <IconButton
            size="small"
            aria-label="Cerrar consejo"
            onClick={() => setConsejoCerrado(pathname)}
            sx={{ position: 'absolute', top: 4, right: 4, color: colores.verde }}
          >
            <Iconify icon="biolab:cruz" width={16} />
          </IconButton>
        </Box>
      )}

      {abierta && racha && (
        <Box
          sx={{
            width: 262,
            p: 2.25,
            borderRadius: '26px',
            bgcolor: colores.crema,
            boxShadow: sombraFlotante,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            animation: `${brincar} .45s cubic-bezier(.2,.8,.2,1) both`,
          }}
        >
          <Typography variant="h6" sx={{ fontFamily: fuenteTitulos }}>
            {rol === 'alumno' ? 'Tu racha con Capi' : 'Racha del laboratorio'}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: colores.verde }}>
            {triste
              ? 'Capi está triste: hubo daños y la racha volvió a cero.'
              : `Capi está feliz: ${dias} ${racha.etiqueta}.`}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {DIAS.map((dia, i) => {
              const cumplido = i < (triste ? 1 : racha.diasCumplidos);
              return (
                <Box
                  key={`${dia}-${i}`}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 900,
                    bgcolor: cumplido ? colores.verde : colores.papelOscuro,
                    color: cumplido ? colores.crema : colores.verde,
                  }}
                >
                  {dia}
                </Box>
              );
            })}
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            {racha.siguienteRecompensa}
          </Typography>
          <Box sx={{ height: 10, borderRadius: 99, bgcolor: colores.papelOscuro, overflow: 'hidden' }}>
            <Box
              sx={{
                height: 1,
                borderRadius: 99,
                bgcolor: colores.verde,
                width: `${Math.round((racha.puntos / racha.puntosSiguienteNivel) * 100)}%`,
                transformOrigin: 'left center',
                animation: `${crecerX} 1s .2s cubic-bezier(.2,.8,.2,1) both`,
              }}
            />
          </Box>
          <Button component={RouterLink} href="/galeria" variant="contained" color="inherit" sx={{ borderRadius: 99, bgcolor: colores.bosque, color: colores.crema }}>
            Ver recompensas de Capi
          </Button>
        </Box>
      )}

      <ButtonBase
        onClick={() => setAbierta((a) => !a)}
        aria-label="Ver la racha de Capi"
        aria-expanded={abierta}
        sx={{
          width: ANCHO_RACHA,
          pt: 1.5,
          pb: 1.75,
          px: 1.25,
          borderRadius: '32px',
          bgcolor: colores.crema,
          boxShadow: sombraFlotante,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          transition: 'transform .12s ease',
          '&:active': { transform: 'scale(.95)' },
        }}
      >
        <Capi animo={triste ? 'triste' : 'feliz'} ancho={96} flotando />
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            py: 0.5,
            pl: 1,
            pr: 1.5,
            borderRadius: 99,
            bgcolor: colores.tinto,
            color: colores.crema,
            fontWeight: 900,
            fontSize: 18,
          }}
        >
          <Iconify
            icon="biolab:llama"
            width={18}
            sx={{ color: '#F2B36B', animation: `${flama} 1.3s ease-in-out infinite`, transformOrigin: '50% 100%' }}
          />
          {dias}
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 800, color: colores.verde, lineHeight: 1.2 }}>
          {racha?.etiqueta ?? ''}
        </Typography>
      </ButtonBase>
    </Box>
  );
}
