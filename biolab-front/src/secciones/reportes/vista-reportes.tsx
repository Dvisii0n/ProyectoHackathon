import type { IconifyName } from 'src/components/iconify/register-icons';
import type { Reporte, Decision, RubroReporte } from 'src/tipos/dominio';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useDatos } from 'src/ganchos/usar-datos';
import { DashboardContent } from 'src/layouts/dashboard';
import { decidirReporte, obtenerReportes } from 'src/servicios';
import { ImagenProtegida } from 'src/componentes/imagen-protegida';
import { ChipEstado, EncabezadoPagina } from 'src/componentes/comunes';
import { sello, colores, brincar, sxAparecer, sxLevantar, sombraSuave, fuenteTitulos } from 'src/componentes/estilos';

import { Iconify } from 'src/components/iconify';

import {
  fechaAmigable,
  aparienciaDecision,
  aparienciaSeveridad,
  aparienciaCalificacion,
} from '../compartido/apariencia';

// ----------------------------------------------------------------------
// Bandeja de reportes: el coordinador decide con un toque por reporte.
// ----------------------------------------------------------------------

type Filtro = 'todos' | 'por-decidir' | 'con-problemas';

const nombresRubro: Record<RubroReporte, string> = {
  limpieza: 'Limpieza',
  material: 'Material',
  equipo: 'Equipo',
  orden: 'Orden',
};

const inclinaciones = ['-1.2deg', '1deg', '.6deg', '-.8deg'];
const fondosFoto = [colores.menta, colores.rosa, colores.durazno, '#F2EFE8'];

type Accion = { decision: Decision; texto: string; icono: IconifyName; fondo: string; circulo: string; colorCirculo: string; colorTexto: string };

const acciones: Accion[] = [
  { decision: 'todo-bien', texto: 'Todo bien', icono: 'biolab:paloma', fondo: colores.menta, circulo: colores.verde, colorCirculo: colores.crema, colorTexto: colores.bosque },
  { decision: 'advertencia', texto: 'Advertir', icono: 'biolab:exclamacion', fondo: colores.durazno, circulo: colores.mandarinaOscura, colorCirculo: colores.crema, colorTexto: colores.bosque },
  { decision: 'sancion', texto: 'Sancionar', icono: 'biolab:escudo', fondo: colores.rosa, circulo: colores.tintoClaro, colorCirculo: colores.crema, colorTexto: colores.bosque },
  { decision: 'baneo', texto: 'Banear', icono: 'biolab:prohibido', fondo: colores.tinto, circulo: colores.crema, colorCirculo: colores.tinto, colorTexto: colores.crema },
];

export function VistaReportes() {
  const { datos: reportes, setDatos: setReportes, cargando } = useDatos(obtenerReportes);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [pendienteDeConfirmar, setPendienteDeConfirmar] = useState<{ reporte: Reporte; decision: Decision } | null>(null);

  const aplicarDecision = async (reporte: Reporte, decision: Decision | null) => {
    // Actualización optimista: se ve al instante y se manda al back por detrás
    setReportes((anteriores) => anteriores?.map((r) => (r.id === reporte.id ? { ...r, decision } : r)) ?? null);
    try {
      await decidirReporte(reporte.id, decision);
    } catch {
      setReportes((anteriores) => anteriores?.map((r) => (r.id === reporte.id ? reporte : r)) ?? null);
    }
  };

  const elegirAccion = (reporte: Reporte, decision: Decision) => {
    // Sancionar y banear piden confirmación con motivo; lo demás es inmediato
    if (decision === 'sancion' || decision === 'baneo') setPendienteDeConfirmar({ reporte, decision });
    else aplicarDecision(reporte, decision);
  };

  const lista = (reportes ?? []).filter((r) => {
    if (filtro === 'por-decidir') return r.decision === null;
    if (filtro === 'con-problemas') return r.severidad !== 'en-orden';
    return true;
  });
  const faltan = (reportes ?? []).filter((r) => r.decision === null).length;

  return (
    <DashboardContent maxWidth="xl">
      <EncabezadoPagina
        antetitulo="Cómo entregaron las aulas"
        titulo="Bandeja de reportes"
        descripcion="Los mandan laboratoristas y profes. Tú solo eliges qué hacer con cada uno."
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3, ...sxAparecer(0.1) }}>
        <Box role="group" aria-label="Filtrar reportes" sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 0.5, p: 0.625, borderRadius: 99, bgcolor: colores.crema, boxShadow: sombraSuave }}>
          {(
            [
              ['todos', 'Todos'],
              ['por-decidir', 'Por decidir'],
              ['con-problemas', 'Con problemas'],
            ] as const
          ).map(([valor, texto]) => (
            <Button
              key={valor}
              onClick={() => setFiltro(valor)}
              aria-pressed={filtro === valor}
              sx={{
                borderRadius: 99,
                px: 2.25,
                minHeight: 44,
                bgcolor: filtro === valor ? colores.bosque : 'transparent',
                color: filtro === valor ? colores.crema : colores.bosque,
                '&:hover': { bgcolor: filtro === valor ? colores.verde : colores.papel },
              }}
            >
              {texto}
            </Button>
          ))}
        </Box>
        <Typography sx={{ ml: 'auto', fontWeight: 800, color: colores.verde }}>
          {faltan === 0 ? 'Todo decidido' : faltan === 1 ? 'Falta 1 por decidir' : `Faltan ${faltan} por decidir`}
        </Typography>
      </Box>

      {!cargando && lista.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6, animation: `${brincar} .45s both` }}>
          <Typography sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 28 }}>Ya decidiste todo</Typography>
          <Typography sx={{ fontWeight: 600, color: colores.verde }}>Capi se va a sus aguas termales. Vuelve cuando lleguen más reportes.</Typography>
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 2.75, alignItems: 'start' }}>
        {lista.map((reporte, i) => (
          <TarjetaReporte
            key={reporte.id}
            reporte={reporte}
            indice={i}
            onElegir={(decision) => elegirAccion(reporte, decision)}
            onDeshacer={() => aplicarDecision(reporte, null)}
          />
        ))}
      </Box>

      <DialogoSancion
        abierto={!!pendienteDeConfirmar}
        decision={pendienteDeConfirmar?.decision ?? 'sancion'}
        grupo={pendienteDeConfirmar?.reporte.titulo ?? ''}
        onCerrar={() => setPendienteDeConfirmar(null)}
        onConfirmar={() => {
          if (pendienteDeConfirmar) aplicarDecision(pendienteDeConfirmar.reporte, pendienteDeConfirmar.decision);
          setPendienteDeConfirmar(null);
        }}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

type TarjetaReporteProps = {
  reporte: Reporte;
  indice: number;
  onElegir: (decision: Decision) => void;
  onDeshacer: () => void;
};

function TarjetaReporte({ reporte, indice, onElegir, onDeshacer }: TarjetaReporteProps) {
  const [viendoFotos, setViendoFotos] = useState(false);
  const severidad = aparienciaSeveridad[reporte.severidad];
  const decision = reporte.decision ? aparienciaDecision[reporte.decision] : null;

  return (
    <Box sx={sxAparecer(0.15 + indice * 0.08)}>
      <Box component="article" sx={{ bgcolor: colores.crema, borderRadius: '28px', boxShadow: sombraSuave, p: 2, display: 'flex', flexDirection: 'column', gap: 1.75, ...sxLevantar }}>
        {/* Foto tipo polaroid con cinta */}
        <Box sx={{ position: 'relative', p: '10px 10px 30px', bgcolor: '#FBFAF7', borderRadius: '6px', boxShadow: '0 6px 16px -10px rgba(90,31,55,.5)', transform: `rotate(${inclinaciones[indice % 4]})` }}>
          <Box aria-hidden sx={{ position: 'absolute', top: -10, left: '50%', width: 84, height: 22, ml: '-42px', bgcolor: colores.rosa, opacity: 0.85, transform: 'rotate(-3deg)', borderRadius: '3px' }} />
          {reporte.fotos[0] ? (
            <ButtonBase onClick={() => setViendoFotos(true)} aria-label={`Ver evidencias de ${reporte.titulo} (${reporte.fotos.length})`} sx={{ position: 'relative', display: 'block', width: 1, height: 150, borderRadius: '4px', overflow: 'hidden' }}>
              <ImagenProtegida src={reporte.fotos[0]} alt={`Evidencia de ${reporte.titulo}`} />
              {reporte.fotos.length > 1 && (
                <Box component="span" sx={{ position: 'absolute', right: 8, bottom: 8, px: 1.25, py: 0.4, borderRadius: 99, bgcolor: 'rgba(52,10,14,.82)', color: colores.crema, fontSize: 13, fontWeight: 800 }}>
                  +{reporte.fotos.length - 1} fotos
                </Box>
              )}
            </ButtonBase>
          ) : (
            <Box sx={{ height: 150, borderRadius: '4px', bgcolor: fondosFoto[indice % 4], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.75, color: colores.verde }}>
              <Iconify icon="biolab:galeria" width={38} />
              <Typography variant="body2" sx={{ fontWeight: 800 }}>{reporte.tipo === 'material' ? 'Foto del material' : 'Foto del aula al entregar'}</Typography>
            </Box>
          )}
          <Typography sx={{ position: 'absolute', left: 14, bottom: 6, fontFamily: fuenteTitulos, fontWeight: 500, fontSize: 14, color: colores.verde }}>
            {fechaAmigable(reporte.fecha)}
          </Typography>
          {decision && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <Box
                sx={{
                  px: 2.25,
                  py: 1,
                  border: `4px solid ${decision.color}`,
                  borderRadius: '12px',
                  color: decision.color,
                  bgcolor: 'rgba(255,254,248,.82)',
                  fontFamily: fuenteTitulos,
                  fontWeight: 700,
                  fontSize: 26,
                  letterSpacing: '.06em',
                  animation: `${sello} .55s cubic-bezier(.2,.8,.2,1) both`,
                }}
              >
                {decision.sello}
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.25, px: 0.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 21, lineHeight: 1.2 }}>{reporte.titulo}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: colores.verde, mt: 0.25 }}>
              {reporte.tipo === 'material' ? 'Material devuelto' : 'Entrega del aula'} · {reporte.nombrePractica} · lo manda: {reporte.autorRol}
            </Typography>
          </Box>
          <ChipEstado texto={severidad.texto} icono={severidad.icono} fondo={severidad.fondo} color={severidad.color} />
        </Box>

        {reporte.calificaciones && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, px: 0.5 }}>
            {(Object.keys(nombresRubro) as RubroReporte[]).map((rubro) => {
              const calificacion = aparienciaCalificacion[reporte.calificaciones![rubro]];
              return (
                <Box key={rubro} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 1, borderRadius: '14px', bgcolor: colores.papel, fontSize: 14, fontWeight: 700 }}>
                  <Iconify icon={calificacion.icono} width={20} sx={{ color: calificacion.color }} />
                  {nombresRubro[rubro]}: {calificacion.texto.toLowerCase()}
                </Box>
              );
            })}
          </Box>
        )}

        {reporte.materialConProblema && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, px: 0.5 }}>
            {reporte.materialConProblema.map((m) => (
              <Box key={m.nombre} sx={{ px: 1.5, py: 1, borderRadius: '14px', bgcolor: colores.rosa }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, color: colores.tinto }}>
                  <Iconify icon="biolab:cruz" width={18} />
                  {m.nombre}
                </Box>
                <Typography variant="body2" sx={{ ml: 3.25, fontWeight: 600 }}>{m.nota}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {reporte.nota && (
          <Typography sx={{ px: 0.5, fontWeight: 600, lineHeight: 1.5 }}>{reporte.nota}</Typography>
        )}

        {decision ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.25, py: 1.25, pl: 2, pr: 1.5, borderRadius: '18px', bgcolor: colores.papel, animation: `${brincar} .45s both` }}>
            <Typography sx={{ fontWeight: 800 }}>{decision.mensaje}</Typography>
            <Button onClick={onDeshacer} sx={{ borderRadius: 99, px: 2, bgcolor: colores.crema, color: colores.bosque, boxShadow: '0 4px 12px -8px rgba(90,31,55,.5)' }}>
              Deshacer
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, pt: 0.5 }}>
            {acciones.map((accion) => (
              <ButtonBase
                key={accion.decision}
                onClick={() => onElegir(accion.decision)}
                sx={{
                  flexDirection: 'column',
                  gap: 0.75,
                  py: 1.25,
                  px: 0.5,
                  minHeight: 84,
                  borderRadius: '18px',
                  bgcolor: accion.fondo,
                  color: accion.colorTexto,
                  fontWeight: 800,
                  fontSize: 13,
                  transition: 'transform .12s ease, filter .2s ease',
                  '&:hover': { filter: 'brightness(1.05)' },
                  '&:active': { transform: 'scale(.95)' },
                }}
              >
                <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: accion.circulo, color: accion.colorCirculo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon={accion.icono} width={22} />
                </Box>
                {accion.texto}
              </ButtonBase>
            ))}
          </Box>
        )}
      </Box>

      <DialogoEvidencias abierto={viendoFotos} titulo={reporte.titulo} fotos={reporte.fotos} onCerrar={() => setViendoFotos(false)} />
    </Box>
  );
}

// ----------------------------------------------------------------------

/** Todas las fotos de evidencia de un reporte */
function DialogoEvidencias({ abierto, titulo, fotos, onCerrar }: { abierto: boolean; titulo: string; fotos: string[]; onCerrar: () => void }) {
  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="md" slotProps={{ paper: { sx: { borderRadius: '28px', bgcolor: colores.crema } } }}>
      <DialogTitle sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>
        Evidencias · {titulo}
        <Typography component="span" sx={{ display: 'block', fontSize: 15, fontWeight: 700, color: colores.verde }}>
          {fotos.length} {fotos.length === 1 ? 'foto' : 'fotos'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {abierto && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1.5 }}>
            {fotos.map((foto, i) => (
              <Box key={foto} sx={{ aspectRatio: '4 / 3', borderRadius: '18px', overflow: 'hidden', bgcolor: colores.papelOscuro }}>
                <ImagenProtegida src={foto} alt={`Evidencia ${i + 1} de ${titulo}`} sx={{ objectFit: 'contain' }} />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onCerrar} sx={{ borderRadius: 99, px: 2.5, bgcolor: colores.papel, color: colores.bosque }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type DialogoSancionProps = {
  abierto: boolean;
  decision: Decision;
  grupo: string;
  onCerrar: () => void;
  onConfirmar: () => void;
};

/** Confirmación con motivo y duración para sancionar o banear */
function DialogoSancion({ abierto, decision, grupo, onCerrar, onConfirmar }: DialogoSancionProps) {
  const esBaneo = decision === 'baneo';

  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '28px', bgcolor: colores.crema } } }}>
      <DialogTitle sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>
        {esBaneo ? 'Banear' : 'Sancionar'} a {grupo}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField label="Motivo" placeholder="Ej. rompieron un baumanómetro y no lo reportaron" multiline minRows={2} fullWidth />
        <TextField select label="¿Por cuánto tiempo?" defaultValue={esBaneo ? '30' : '7'} fullWidth>
          <MenuItem value="1">1 día</MenuItem>
          <MenuItem value="7">1 semana</MenuItem>
          <MenuItem value="30">1 mes</MenuItem>
          <MenuItem value="semestre">Todo el semestre</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onCerrar} sx={{ borderRadius: 99, px: 2.5, color: colores.bosque }}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirmar}
          variant="contained"
          sx={{ borderRadius: 99, px: 2.5, bgcolor: esBaneo ? colores.tinto : colores.tintoClaro, color: colores.crema, '&:hover': { bgcolor: colores.tinto } }}
        >
          {esBaneo ? 'Banear' : 'Sancionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
