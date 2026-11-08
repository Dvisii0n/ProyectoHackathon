import type { IconifyName } from 'src/components/iconify/register-icons';
import type { FotoPractica, IdRecompensa, FormatoCollage } from 'src/tipos/dominio';

import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

import { Capi } from 'src/componentes/capi';
import { useSesion } from 'src/contexto/sesion';
import { useDatos } from 'src/ganchos/usar-datos';
import { DashboardContent } from 'src/layouts/dashboard';
import { Tarjeta, EncabezadoPagina } from 'src/componentes/comunes';
import { generarCollage, columnasCollage, descargarArchivo } from 'src/utilidades/collage';
import { subirFoto, obtenerRacha, obtenerMisFotos, obtenerRecompensas } from 'src/servicios';
import { colores, brincar, crecerX, sxAparecer, sxLevantar, sombraSuave, fuenteTitulos } from 'src/componentes/estilos';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Rincón del alumno: Capi con sus recompensas, fotos de prácticas y collage.
// ----------------------------------------------------------------------

const iconosRecompensa: Record<IdRecompensa, { icono: IconifyName; fondo: string; color: string }> = {
  mandarina: { icono: 'biolab:mandarina', fondo: colores.durazno, color: colores.mandarinaOscura },
  lentes: { icono: 'biolab:lentes', fondo: colores.menta, color: colores.verde },
  bata: { icono: 'biolab:bata', fondo: '#F2EFE8', color: colores.verde },
  gorro: { icono: 'biolab:gorro', fondo: colores.papelOscuro, color: '#7A7F70' },
  termal: { icono: 'biolab:termal', fondo: colores.papelOscuro, color: '#7A7F70' },
};

const TINTES = ['#EAE5DB', '#EAD3DC', '#F2E2D2', '#F2EFE8', '#A9A9A9', '#D8D2C4', '#E3B98C', '#C9C3B5', '#E59C97'];
const INCLINACIONES = ['-2deg', '1.5deg', '-1deg', '2deg', '-1.5deg', '1deg', '-2.5deg', '1.8deg', '-.8deg'];
const MINIMO_FOTOS = 4;
const MAXIMO_FOTOS = 9;

export function VistaGaleria() {
  const { rol } = useSesion();
  const { datos: racha } = useDatos(() => obtenerRacha(rol), [rol]);
  const { datos: recompensas } = useDatos(obtenerRecompensas);
  const { datos: fotos, setDatos: setFotos } = useDatos(obtenerMisFotos);

  const [puestos, setPuestos] = useState<Partial<Record<IdRecompensa, boolean>>>({ mandarina: true });
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [formato, setFormato] = useState<FormatoCollage>('post');
  const [descargando, setDescargando] = useState(false);
  const entradaFoto = useRef<HTMLInputElement>(null);

  const nivel = racha?.nivel ?? 1;
  const progreso = racha ? Math.round((racha.puntos / racha.puntosSiguienteNivel) * 100) : 0;
  const fotosElegidas = elegidas.map((id) => fotos?.find((f) => f.id === id)).filter((f): f is FotoPractica => !!f);
  const listo = fotosElegidas.length >= MINIMO_FOTOS;

  const alternarFoto = (id: string) =>
    setElegidas((anteriores) => {
      if (anteriores.includes(id)) return anteriores.filter((x) => x !== id);
      if (anteriores.length >= MAXIMO_FOTOS) return anteriores;
      return [...anteriores, id];
    });

  const descargar = async () => {
    if (!listo) return;
    setDescargando(true);
    try {
      const blob = await generarCollage(fotosElegidas, formato, 'Siembra de cultivos');
      descargarArchivo(blob, `collage-biolab-${formato}.png`);
    } finally {
      setDescargando(false);
    }
  };

  const alSubir = async (archivo: File | undefined) => {
    if (!archivo) return;
    const nueva = await subirFoto('p-1', archivo);
    // Queda pendiente: no se muestra hasta que el laboratorista la apruebe
    if (nueva.estado === 'aprobada') setFotos((anteriores) => [nueva, ...(anteriores ?? [])]);
  };

  return (
    <DashboardContent maxWidth="xl">
      <EncabezadoPagina antetitulo="Tu rincón" titulo="Capi y tus prácticas" />

      {/* Capi con lo que tiene puesto */}
      <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: colores.salviaClara, borderRadius: '34px', p: { xs: 3, md: 4 }, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3.5, mb: 3, ...sxAparecer(0.08) }}>
        <Box sx={{ flex: '0 0 auto', width: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 'auto' }}>
          <Capi ancho={240} accesorios={puestos} flotando etiqueta="Capi, tu mascota" />
          <Box sx={{ width: 160, height: 14, mt: -0.5, borderRadius: '50%', bgcolor: 'rgba(90,31,55,.14)' }} />
        </Box>
        <Box sx={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 1.5 }}>
            <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 36 }}>Capi</Typography>
            <Box component="span" sx={{ px: 1.75, py: 0.6, borderRadius: 99, bgcolor: colores.bosque, color: colores.crema, fontWeight: 800, fontSize: 14 }}>
              Nivel {nivel}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14 }}>
            <span>{racha ? `${racha.puntos} de ${racha.puntosSiguienteNivel} puntos` : ''}</span>
            <Box component="span" sx={{ color: colores.verde }}>Nivel {nivel + 1}</Box>
          </Box>
          <Box sx={{ height: 16, borderRadius: 99, bgcolor: colores.crema, overflow: 'hidden' }}>
            <Box sx={{ height: 1, width: `${progreso}%`, borderRadius: 99, bgcolor: colores.verde, transformOrigin: 'left center', animation: `${crecerX} 1.1s .35s cubic-bezier(.2,.8,.2,1) both` }} />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            <Regla icono="biolab:paloma" texto="+10 por práctica bien entregada" />
            <Regla icono="biolab:galeria" texto="+5 por foto aprobada" />
            <Regla icono="biolab:cruz" texto="Si se rompe algo, Capi se pone triste y la racha vuelve a 0" alerta />
          </Box>
        </Box>
      </Box>

      {/* Recompensas */}
      <Box sx={{ mb: 3, ...sxAparecer(0.16) }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 1.75 }}>
          <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 26 }}>Recompensas</Typography>
          <Typography sx={{ fontWeight: 700, color: colores.verde }}>Toca una desbloqueada para ponérsela a Capi</Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1.75 }}>
          {recompensas?.map((recompensa) => {
            const bloqueada = recompensa.nivelRequerido > nivel;
            const puesta = !bloqueada && !!puestos[recompensa.id];
            const apariencia = iconosRecompensa[recompensa.id];
            return (
              <ButtonBase
                key={recompensa.id}
                disabled={bloqueada}
                onClick={() => setPuestos((anteriores) => ({ ...anteriores, [recompensa.id]: !anteriores[recompensa.id] }))}
                aria-pressed={puesta}
                sx={{
                  position: 'relative',
                  flexDirection: 'column',
                  gap: 1,
                  pt: 2.5,
                  pb: 2,
                  px: 1.5,
                  borderRadius: '26px',
                  textAlign: 'center',
                  bgcolor: bloqueada ? 'rgba(255,254,248,.55)' : colores.crema,
                  opacity: bloqueada ? 0.75 : 1,
                  boxShadow: puesta ? `inset 0 0 0 3px ${colores.verde}, ${sombraSuave}` : bloqueada ? 'none' : sombraSuave,
                  ...(!bloqueada && sxLevantar),
                }}
              >
                <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                  {bloqueada && (
                    <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: colores.papelOscuro, color: colores.verde, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Iconify icon="biolab:candado" width={16} />
                    </Box>
                  )}
                  {puesta && (
                    <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: colores.verde, color: colores.crema, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: `${brincar} .45s both` }}>
                      <Iconify icon="biolab:paloma" width={16} />
                    </Box>
                  )}
                </Box>
                <Box sx={{ width: 58, height: 58, borderRadius: '20px', bgcolor: apariencia.fondo, color: apariencia.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon={apariencia.icono} width={30} />
                </Box>
                <Typography sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 17, lineHeight: 1.2, color: colores.bosque }}>{recompensa.nombre}</Typography>
                <Box
                  component="span"
                  sx={{ fontSize: 12, fontWeight: 800, px: 1.25, py: 0.4, borderRadius: 99, bgcolor: bloqueada ? colores.papelOscuro : puesta ? colores.verde : colores.papel, color: puesta ? colores.crema : colores.verde }}
                >
                  {bloqueada ? `Nivel ${recompensa.nivelRequerido}` : puesta ? 'Puesta' : 'Toca para ponerla'}
                </Box>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, alignItems: 'flex-start', ...sxAparecer(0.24) }}>
        {/* Fotos de prácticas */}
        <Tarjeta sx={{ flex: '1.5 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>Fotos de mis prácticas</Typography>
            <input ref={entradaFoto} type="file" accept="image/*" hidden onChange={(e) => alSubir(e.target.files?.[0])} />
            <Button onClick={() => entradaFoto.current?.click()} startIcon={<Iconify icon="biolab:subir" />} sx={{ borderRadius: 99, px: 2.5, minHeight: 48, bgcolor: colores.verde, color: colores.crema, '&:hover': { bgcolor: colores.bosque } }}>
              Subir foto
            </Button>
          </Box>
          <Typography sx={{ fontWeight: 700, color: colores.verde }}>
            El laboratorista aprueba cada foto antes de que aparezca aquí. Elige de {MINIMO_FOTOS} a {MAXIMO_FOTOS} para tu collage.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))', gap: 1.75 }}>
            {fotos?.map((foto, i) => {
              const orden = elegidas.indexOf(foto.id);
              const elegida = orden >= 0;
              return (
                <ButtonBase
                  key={foto.id}
                  onClick={() => alternarFoto(foto.id)}
                  aria-pressed={elegida}
                  sx={{
                    position: 'relative',
                    aspectRatio: '4 / 5',
                    p: '8px 8px 6px',
                    flexDirection: 'column',
                    gap: 0.6,
                    borderRadius: '6px',
                    bgcolor: '#FBFAF7',
                    transform: `rotate(${INCLINACIONES[i % INCLINACIONES.length]})`,
                    transition: 'transform .25s ease, box-shadow .25s ease',
                    boxShadow: elegida ? `0 0 0 3px ${colores.verde}, 0 12px 22px -12px rgba(90,31,55,.6)` : '0 8px 18px -10px rgba(90,31,55,.45)',
                    '&:hover': { transform: 'rotate(0deg) scale(1.03)' },
                  }}
                >
                  {foto.url ? (
                    <Box component="img" src={foto.url} alt={foto.titulo} sx={{ flex: 1, width: 1, objectFit: 'cover', borderRadius: '3px' }} />
                  ) : (
                    <Box sx={{ flex: 1, width: 1, borderRadius: '3px', bgcolor: TINTES[i % TINTES.length], color: colores.verde, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Iconify icon="biolab:galeria" width={28} />
                    </Box>
                  )}
                  <Typography sx={{ fontFamily: fuenteTitulos, fontWeight: 500, fontSize: 13, color: colores.verde }}>{foto.titulo}</Typography>
                  {elegida && (
                    <Box sx={{ position: 'absolute', top: -8, right: -8, minWidth: 30, height: 30, px: 1, borderRadius: 99, bgcolor: colores.bosque, color: colores.crema, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, animation: `${brincar} .45s both` }}>
                      {orden + 1}
                    </Box>
                  )}
                </ButtonBase>
              );
            })}
          </Box>
        </Tarjeta>

        {/* Collage */}
        <Tarjeta sx={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{ alignSelf: 'stretch', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.25 }}>
            <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>Mi collage</Typography>
            <Box role="group" aria-label="Formato" sx={{ display: 'inline-flex', gap: 0.5, p: 0.5, borderRadius: 99, bgcolor: colores.papel }}>
              {(
                [
                  ['post', 'Post'],
                  ['historia', 'Historia'],
                ] as const
              ).map(([valor, texto]) => (
                <Button
                  key={valor}
                  onClick={() => setFormato(valor)}
                  aria-pressed={formato === valor}
                  sx={{ borderRadius: 99, minHeight: 40, px: 2.25, bgcolor: formato === valor ? colores.bosque : 'transparent', color: formato === valor ? colores.crema : colores.bosque, '&:hover': { bgcolor: formato === valor ? colores.verde : colores.papelOscuro } }}
                >
                  {texto}
                </Button>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              width: 1,
              maxWidth: formato === 'post' ? 290 : 220,
              aspectRatio: formato === 'post' ? '4 / 5' : '9 / 16',
              bgcolor: colores.bosque,
              borderRadius: '22px',
              p: 1.75,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
              boxShadow: '0 18px 36px -18px rgba(90,31,55,.7)',
              transition: 'max-width .35s ease',
            }}
          >
            <Typography sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 16, color: colores.crema, textAlign: 'center' }}>Siembra de cultivos</Typography>
            <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gap: 0.75, gridTemplateColumns: `repeat(${columnasCollage(fotosElegidas.length)}, minmax(0, 1fr))`, gridAutoRows: '1fr' }}>
              {fotosElegidas.map((foto) => {
                const indice = fotos?.findIndex((f) => f.id === foto.id) ?? 0;
                return foto.url ? (
                  <Box key={foto.id} component="img" src={foto.url} alt="" sx={{ width: 1, height: 1, objectFit: 'cover', borderRadius: '10px', animation: `${brincar} .45s both` }} />
                ) : (
                  <Box key={foto.id} sx={{ borderRadius: '10px', bgcolor: TINTES[indice % TINTES.length], animation: `${brincar} .45s both` }} />
                );
              })}
            </Box>
            {fotosElegidas.length === 0 && (
              <Typography variant="body2" sx={{ fontWeight: 700, color: colores.salviaClara, textAlign: 'center' }}>Toca fotos para llenar tu collage</Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 15, color: colores.crema }}>
              <Capi ancho={34} />
              Biolab · Ciencias Biomédicas
            </Box>
          </Box>

          <Button
            onClick={descargar}
            disabled={!listo || descargando}
            fullWidth
            size="large"
            startIcon={<Iconify icon="biolab:descargar" />}
            sx={{ borderRadius: 99, minHeight: 54, fontSize: 17, bgcolor: colores.tinto, color: colores.crema, boxShadow: '0 14px 28px -14px rgba(103,27,28,.8)', '&:hover': { bgcolor: colores.tintoClaro }, '&.Mui-disabled': { bgcolor: colores.papelOscuro, color: colores.verde, boxShadow: 'none' } }}
          >
            {descargando ? 'Armando tu collage…' : 'Descargar collage'}
          </Button>
          <Typography variant="body2" sx={{ fontWeight: 700, color: colores.verde, textAlign: 'center' }}>
            {listo ? `${fotosElegidas.length} fotos elegidas` : `Elige al menos ${MINIMO_FOTOS} fotos (llevas ${fotosElegidas.length})`}
          </Typography>
        </Tarjeta>
      </Box>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function Regla({ icono, texto, alerta = false }: { icono: IconifyName; texto: string; alerta?: boolean }) {
  return (
    <Box
      component="span"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.875, borderRadius: '14px', fontWeight: 800, fontSize: 13, bgcolor: alerta ? colores.rosa : colores.crema, color: alerta ? colores.tinto : colores.bosque }}
    >
      <Iconify icon={icono} width={16} sx={{ color: alerta ? colores.tinto : colores.verde }} />
      {texto}
    </Box>
  );
}
