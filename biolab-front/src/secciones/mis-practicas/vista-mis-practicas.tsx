import type { Practica, SolicitudMaterial } from 'src/tipos/dominio';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { useSesion } from 'src/contexto/sesion';
import { useDatos } from 'src/ganchos/usar-datos';
import { DashboardContent } from 'src/layouts/dashboard';
import { Tarjeta, ChipEstado, EncabezadoPagina } from 'src/componentes/comunes';
import { colores, sxAparecer, sxLevantar, sombraSuave, fuenteTitulos } from 'src/componentes/estilos';
import { ventanaParaPedir, obtenerSolicitudes, obtenerMisPracticas, obtenerReportesDeEquipo } from 'src/servicios';

import { Iconify } from 'src/components/iconify';

import { fechaLarga, horarioPractica, aparienciaDecision, aparienciaSolicitud, aparienciaLaboratorio } from '../compartido/apariencia';

// ----------------------------------------------------------------------
// Alumno: las prácticas asignadas a su equipo, el estado de su material
// y los reportes que haya recibido el equipo.
// ----------------------------------------------------------------------

export function VistaMisPracticas() {
  const { usuario } = useSesion();
  const { datos } = useDatos(() => obtenerMisPracticas(usuario.id), [usuario.id]);
  const equipo = datos?.equipo ?? null;

  const { datos: solicitudes } = useDatos(() => (equipo ? obtenerSolicitudes({ equipoId: equipo.id }) : Promise.resolve([])), [equipo?.id]);
  const { datos: reportes } = useDatos(() => (equipo ? obtenerReportesDeEquipo(equipo.id) : Promise.resolve([])), [equipo?.id]);

  const ahora = new Date();
  const proximas = (datos?.practicas ?? []).filter((p) => new Date(p.inicio) >= ahora);
  const pasadas = (datos?.practicas ?? []).filter((p) => new Date(p.inicio) < ahora).reverse();

  return (
    <DashboardContent maxWidth="lg">
      <EncabezadoPagina antetitulo="Lo que te toca" titulo="Mis prácticas" descripcion="El material se pide por equipo, a partir de una semana antes de cada práctica." />

      {equipo && (
        <Box sx={{ bgcolor: colores.salviaClara, borderRadius: '28px', p: 2.75, mb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, ...sxAparecer(0.08) }}>
          <Box sx={{ width: 52, height: 52, borderRadius: '18px', bgcolor: colores.crema, color: colores.verde, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Iconify icon="biolab:usuarios" width={28} />
          </Box>
          <Box sx={{ flex: '1 1 240px' }}>
            <Typography sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 22 }}>
              {equipo.nombre} · Grupo {equipo.grupo}
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>{equipo.integrantes.map((i) => i.nombre).join(', ')}</Typography>
          </Box>
        </Box>
      )}

      {(reportes ?? []).length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1.5, ...sxAparecer(0.12) }}>
          {reportes?.map((reporte) => (
            <Box key={reporte.id} sx={{ p: 2.25, borderRadius: '24px', bgcolor: colores.rosa, display: 'flex', gap: 1.75, alignItems: 'flex-start' }}>
              <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: colores.tinto, color: colores.crema, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Iconify icon="biolab:alerta" width={22} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 900, color: colores.tinto }}>Reporte por material: {reporte.nombrePractica}</Typography>
                {reporte.materialConProblema?.map((m) => (
                  <Typography key={m.nombre} sx={{ fontWeight: 600 }}>
                    {m.nombre}: {m.nota}
                  </Typography>
                ))}
                <Typography variant="body2" sx={{ fontWeight: 800, mt: 0.75 }}>
                  {reporte.decision ? `Decisión de coordinación: ${aparienciaDecision[reporte.decision].mensaje.toLowerCase()}` : 'La coordinación ya fue avisada y lo está revisando.'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {!equipo && datos && (
        <Tarjeta>
          <Typography sx={{ fontWeight: 700 }}>Todavía no estás en ningún equipo. Tu profesor te agrega a principio de semestre.</Typography>
        </Tarjeta>
      )}

      {proximas.length > 0 && <Titulo>Próximas</Titulo>}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {proximas.map((practica, i) => (
          <TarjetaPractica key={practica.id} practica={practica} indice={i} solicitud={solicitudes?.find((s) => s.practicaId === practica.id)} />
        ))}
      </Box>

      {pasadas.length > 0 && <Titulo>Ya pasaron</Titulo>}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {pasadas.map((practica, i) => (
          <TarjetaPractica key={practica.id} practica={practica} indice={i} solicitud={solicitudes?.find((s) => s.practicaId === practica.id)} />
        ))}
      </Box>
    </DashboardContent>
  );
}

function Titulo({ children }: { children: React.ReactNode }) {
  return (
    <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

function TarjetaPractica({ practica, indice, solicitud }: { practica: Practica; indice: number; solicitud?: SolicitudMaterial }) {
  const lab = aparienciaLaboratorio[practica.laboratorioId];
  const ventana = ventanaParaPedir(practica);

  return (
    <Box sx={sxAparecer(0.14 + indice * 0.06)}>
      <Box sx={{ bgcolor: colores.crema, borderRadius: '26px', boxShadow: sombraSuave, p: 2.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, opacity: ventana.estado === 'pasada' ? 0.8 : 1, ...sxLevantar }}>
        <Box sx={{ width: 54, height: 54, borderRadius: '18px', bgcolor: lab.fondo, color: lab.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Iconify icon={lab.icono} width={28} />
        </Box>
        <Box sx={{ flex: '1 1 240px', minWidth: 0 }}>
          <Typography sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 21, lineHeight: 1.2 }}>{practica.nombre}</Typography>
          <Typography sx={{ fontWeight: 700, color: colores.verde }}>
            {lab.nombre} · {horarioPractica(practica.inicio, practica.duracionHoras)}
          </Typography>
          {practica.descripcion && <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{practica.descripcion}</Typography>}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 1 }}>
          {solicitud ? (
            <>
              <ChipEstado {...aparienciaSolicitud[solicitud.estado]} />
              <Button component={RouterLink} href={`/pedir-material?practica=${practica.id}`} sx={{ borderRadius: 99, px: 2.25, bgcolor: colores.bosque, color: colores.crema, '&:hover': { bgcolor: colores.verde } }}>
                {solicitud.estado === 'aprobada' ? 'Ver mi QR' : 'Ver solicitud'}
              </Button>
            </>
          ) : ventana.estado === 'abierta' ? (
            <Button component={RouterLink} href={`/pedir-material?practica=${practica.id}`} startIcon={<Iconify icon="biolab:caja" />} sx={{ borderRadius: 99, px: 2.5, minHeight: 46, bgcolor: colores.verde, color: colores.crema, '&:hover': { bgcolor: colores.bosque } }}>
              Pedir material
            </Button>
          ) : ventana.estado === 'cerrada' ? (
            <ChipEstado texto={`Pide material desde el ${fechaLarga(ventana.abre)}`} icono="biolab:candado" fondo={colores.papelOscuro} color={colores.verde} />
          ) : (
            <ChipEstado texto="Sin solicitud de material" icono="biolab:reloj" fondo={colores.papelOscuro} color={colores.verde} />
          )}
        </Box>
      </Box>
    </Box>
  );
}
