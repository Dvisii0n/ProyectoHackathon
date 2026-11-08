import type { EstadoDevolucion, SolicitudMaterial } from 'src/tipos/dominio';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

import { useDatos } from 'src/ganchos/usar-datos';
import { DashboardContent } from 'src/layouts/dashboard';
import { ChipEstado, EncabezadoPagina } from 'src/componentes/comunes';
import { colores, brincar, sxAparecer, sombraSuave, fuenteTitulos } from 'src/componentes/estilos';
import { revisarSolicitud, entregarSolicitud, obtenerSolicitudes, registrarDevolucion } from 'src/servicios';

import { Iconify } from 'src/components/iconify';

import { fechaAmigable, horarioPractica, aparienciaSolicitud } from '../compartido/apariencia';

// ----------------------------------------------------------------------
// Laboratorista: todo el ciclo del material en un solo lugar.
// 1. Por revisar  → palomea qué presta (checklist) y al equipo le llega un QR
// 2. Por entregar → escanea el QR y entrega
// 3. Por recibir  → al terminar la práctica revisa cómo regresó cada cosa
// ----------------------------------------------------------------------

type Pestana = 'revisar' | 'entregar' | 'recibir' | 'historial';

const pestanas: { id: Pestana; texto: string; estados: SolicitudMaterial['estado'][] }[] = [
  { id: 'revisar', texto: 'Por revisar', estados: ['pendiente'] },
  { id: 'entregar', texto: 'Por entregar', estados: ['aprobada'] },
  { id: 'recibir', texto: 'Por recibir', estados: ['entregada'] },
  { id: 'historial', texto: 'Historial', estados: ['rechazada', 'devuelta', 'con-problemas'] },
];

export function VistaSolicitudes() {
  const { datos: solicitudes, setDatos: setSolicitudes } = useDatos(() => obtenerSolicitudes());
  const [pestana, setPestana] = useState<Pestana>('revisar');
  const [aviso, setAviso] = useState<{ tipo: 'success' | 'warning' | 'error'; texto: string } | null>(null);

  const reemplazar = (nueva: SolicitudMaterial) =>
    setSolicitudes((anteriores) => anteriores?.map((s) => (s.id === nueva.id ? nueva : s)) ?? null);

  const actual = pestanas.find((p) => p.id === pestana) ?? pestanas[0];
  const lista = (solicitudes ?? []).filter((s) => actual.estados.includes(s.estado));

  return (
    <DashboardContent maxWidth="lg">
      <EncabezadoPagina antetitulo="Material de los equipos" titulo="Solicitudes" descripcion="Revisa, entrega y recibe. Si algo regresa mal, el reporte les llega al equipo y al coordinador." />

      <Box role="tablist" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, p: 0.625, mb: 3, borderRadius: '28px', bgcolor: colores.crema, boxShadow: sombraSuave, width: 'fit-content', maxWidth: 1, ...sxAparecer(0.08) }}>
        {pestanas.map((p) => {
          const cuantas = (solicitudes ?? []).filter((s) => p.estados.includes(s.estado)).length;
          const activa = p.id === pestana;
          return (
            <Button
              key={p.id}
              role="tab"
              aria-selected={activa}
              onClick={() => {
                setPestana(p.id);
                setAviso(null);
              }}
              sx={{ borderRadius: 99, px: 2.25, minHeight: 46, gap: 1, bgcolor: activa ? colores.bosque : 'transparent', color: activa ? colores.crema : colores.bosque, '&:hover': { bgcolor: activa ? colores.verde : colores.papel } }}
            >
              {p.texto}
              {p.id !== 'historial' && cuantas > 0 && (
                <Box component="span" sx={{ minWidth: 24, height: 24, px: 0.75, borderRadius: 99, bgcolor: activa ? colores.mandarina : colores.tinto, color: colores.crema, fontSize: 13, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cuantas}
                </Box>
              )}
            </Button>
          );
        })}
      </Box>

      {aviso && (
        <Alert severity={aviso.tipo} onClose={() => setAviso(null)} sx={{ mb: 2.5, borderRadius: '18px', fontWeight: 700 }}>
          {aviso.texto}
        </Alert>
      )}

      {pestana === 'entregar' && (
        <EscanearQr
          onEntregar={async (codigo) => {
            try {
              const entregada = await entregarSolicitud(codigo);
              reemplazar(entregada);
              setAviso({ tipo: 'success', texto: `Material entregado a ${entregada.nombreEquipo} (${entregada.grupo}).` });
            } catch (e) {
              setAviso({ tipo: 'error', texto: e instanceof Error ? e.message : 'No se pudo entregar' });
            }
          }}
        />
      )}

      {lista.length === 0 && (
        <Typography sx={{ fontWeight: 700, color: colores.verde, py: 3 }}>No hay nada aquí por ahora.</Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
        {lista.map((solicitud, i) => (
          <Box key={solicitud.id} sx={sxAparecer(0.1 + i * 0.06)}>
            {pestana === 'revisar' && (
              <TarjetaRevisar
                solicitud={solicitud}
                onEnviar={async (aceptados) => {
                  const revisada = await revisarSolicitud(solicitud.id, aceptados);
                  reemplazar(revisada);
                  setAviso(
                    revisada.estado === 'aprobada'
                      ? { tipo: 'success', texto: `Aprobada. A ${revisada.nombreEquipo} le llegó su QR de aprobación.` }
                      : { tipo: 'warning', texto: `Rechazaste toda la solicitud de ${revisada.nombreEquipo}.` }
                  );
                }}
              />
            )}
            {pestana === 'entregar' && (
              <TarjetaBase solicitud={solicitud}>
                <ListaRenglones solicitud={solicitud} soloAceptados />
                {/* Atajo del prototipo: con el back real se entrega solo escaneando el QR */}
                <Button
                  onClick={async () => {
                    const entregada = await entregarSolicitud(solicitud.codigoQr ?? '');
                    reemplazar(entregada);
                    setAviso({ tipo: 'success', texto: `Material entregado a ${entregada.nombreEquipo}.` });
                  }}
                  startIcon={<Iconify icon="biolab:qr" />}
                  sx={{ alignSelf: 'flex-start', borderRadius: 99, px: 2.5, bgcolor: colores.bosque, color: colores.crema, '&:hover': { bgcolor: colores.verde } }}
                >
                  Marcar como entregado
                </Button>
              </TarjetaBase>
            )}
            {pestana === 'recibir' && (
              <TarjetaRecibir
                solicitud={solicitud}
                onRegistrar={async (revision) => {
                  const devuelta = await registrarDevolucion(solicitud.id, revision);
                  reemplazar(devuelta);
                  setAviso(
                    devuelta.estado === 'con-problemas'
                      ? { tipo: 'warning', texto: `Se envió un reporte a ${devuelta.nombreEquipo} y al coordinador.` }
                      : { tipo: 'success', texto: `${devuelta.nombreEquipo} regresó todo en orden.` }
                  );
                }}
              />
            )}
            {pestana === 'historial' && (
              <TarjetaBase solicitud={solicitud}>
                <ListaRenglones solicitud={solicitud} />
              </TarjetaBase>
            )}
          </Box>
        ))}
      </Box>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function TarjetaBase({ solicitud, children }: { solicitud: SolicitudMaterial; children: React.ReactNode }) {
  return (
    <Box sx={{ bgcolor: colores.crema, borderRadius: '26px', boxShadow: sombraSuave, p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 21, lineHeight: 1.2 }}>
            {solicitud.nombreEquipo} · Grupo {solicitud.grupo}
          </Typography>
          <Typography sx={{ fontWeight: 700, color: colores.verde }}>
            {solicitud.nombrePractica} · {horarioPractica(solicitud.inicioPractica, 1).split(' a ')[0]}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Pidió {solicitud.solicitanteNombre}, {fechaAmigable(solicitud.fecha)}
          </Typography>
        </Box>
        <ChipEstado {...aparienciaSolicitud[solicitud.estado]} />
      </Box>
      {children}
    </Box>
  );
}

function ListaRenglones({ solicitud, soloAceptados = false }: { solicitud: SolicitudMaterial; soloAceptados?: boolean }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {solicitud.renglones
        .filter((r) => !soloAceptados || r.aceptado)
        .map((r) => {
          const mal = r.aceptado === false || r.devolucion?.estado === 'con-problema';
          return (
            <Box key={r.articuloId} sx={{ px: 1.75, py: 1, borderRadius: '14px', bgcolor: colores.papel }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, textDecoration: r.aceptado === false ? 'line-through' : 'none' }}>
                <Iconify icon={mal ? 'biolab:cruz' : 'biolab:paloma'} width={18} sx={{ color: mal ? colores.tinto : colores.verde }} />
                {r.cantidad} × {r.nombre}
              </Box>
              {r.devolucion?.nota && <Typography variant="body2" sx={{ ml: 3.25, fontWeight: 700, color: colores.tinto }}>Nota: {r.devolucion.nota}</Typography>}
            </Box>
          );
        })}
    </Box>
  );
}

// ---------------------------- 1. Revisar (checklist) ----------------------------

function TarjetaRevisar({ solicitud, onEnviar }: { solicitud: SolicitudMaterial; onEnviar: (aceptados: Record<string, boolean>) => Promise<void> }) {
  const [aceptados, setAceptados] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(solicitud.renglones.map((r) => [r.articuloId, true]))
  );
  const [enviando, setEnviando] = useState(false);
  const cuantos = Object.values(aceptados).filter(Boolean).length;

  return (
    <TarjetaBase solicitud={solicitud}>
      <Typography sx={{ fontWeight: 800 }}>Palomea lo que sí prestas:</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {solicitud.renglones.map((r) => {
          const si = aceptados[r.articuloId];
          return (
            <ButtonBase
              key={r.articuloId}
              onClick={() => setAceptados((a) => ({ ...a, [r.articuloId]: !a[r.articuloId] }))}
              role="checkbox"
              aria-checked={si}
              sx={{ justifyContent: 'flex-start', gap: 1.5, px: 1.75, py: 1.25, borderRadius: '16px', textAlign: 'left', bgcolor: si ? colores.menta : colores.rosa, transition: 'background .2s ease' }}
            >
              <Box sx={{ width: 30, height: 30, borderRadius: '9px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: si ? colores.verde : colores.tinto, color: colores.crema }}>
                <Iconify key={String(si)} icon={si ? 'biolab:paloma' : 'biolab:cruz'} width={18} sx={{ animation: `${brincar} .3s both` }} />
              </Box>
              <Box sx={{ flex: 1, fontWeight: 800, textDecoration: si ? 'none' : 'line-through' }}>
                {r.cantidad} × {r.nombre}
              </Box>
              <Box sx={{ fontSize: 13, fontWeight: 800, color: si ? colores.verde : colores.tinto }}>{si ? 'Se presta' : 'No se presta'}</Box>
            </ButtonBase>
          );
        })}
      </Box>
      <Button
        disabled={enviando}
        onClick={async () => {
          setEnviando(true);
          try {
            await onEnviar(aceptados);
          } finally {
            setEnviando(false);
          }
        }}
        startIcon={<Iconify icon={cuantos > 0 ? 'biolab:qr' : 'biolab:cruz'} />}
        sx={{ alignSelf: 'flex-start', borderRadius: 99, minHeight: 50, px: 3, bgcolor: cuantos > 0 ? colores.verde : colores.tinto, color: colores.crema, '&:hover': { bgcolor: cuantos > 0 ? colores.bosque : colores.tintoClaro } }}
      >
        {cuantos > 0 ? `Aprobar ${cuantos} de ${solicitud.renglones.length} y mandar QR` : 'Rechazar solicitud'}
      </Button>
    </TarjetaBase>
  );
}

// ---------------------------- 2. Entregar (QR) ----------------------------

function EscanearQr({ onEntregar }: { onEntregar: (codigo: string) => Promise<void> }) {
  const [codigo, setCodigo] = useState('');

  return (
    <Box
      component="form"
      onSubmit={async (e: React.FormEvent) => {
        e.preventDefault();
        if (!codigo.trim()) return;
        await onEntregar(codigo);
        setCodigo('');
      }}
      sx={{ mb: 2.5, p: 2.5, borderRadius: '26px', bgcolor: colores.salviaClara, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}
    >
      <Box sx={{ width: 52, height: 52, borderRadius: '18px', bgcolor: colores.crema, color: colores.verde, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Iconify icon="biolab:qr" width={28} />
      </Box>
      {/* TODO: abrir la cámara para leer el QR (p. ej. con la librería html5-qrcode). Un lector USB escribe aquí el código. */}
      <TextField
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        label="Escanea o escribe el código del QR"
        placeholder="BIOLAB-SOLICITUD-…"
        sx={{ flex: '1 1 260px', bgcolor: colores.crema, borderRadius: 2 }}
      />
      <Button type="submit" sx={{ borderRadius: 99, minHeight: 50, px: 3, bgcolor: colores.bosque, color: colores.crema, '&:hover': { bgcolor: colores.verde } }}>
        Entregar
      </Button>
    </Box>
  );
}

// ---------------------------- 3. Recibir (devolución con notas) ----------------------------

function TarjetaRecibir({
  solicitud,
  onRegistrar,
}: {
  solicitud: SolicitudMaterial;
  onRegistrar: (revision: Record<string, { estado: EstadoDevolucion; nota?: string }>) => Promise<void>;
}) {
  const entregados = solicitud.renglones.filter((r) => r.aceptado);
  const [revision, setRevision] = useState<Record<string, { estado: EstadoDevolucion; nota: string }>>(() =>
    Object.fromEntries(entregados.map((r) => [r.articuloId, { estado: 'bien' as EstadoDevolucion, nota: '' }]))
  );
  const [guardando, setGuardando] = useState(false);

  const conProblema = Object.values(revision).filter((r) => r.estado === 'con-problema');
  const faltaNota = conProblema.some((r) => !r.nota.trim());

  const cambiar = (id: string, cambio: Partial<{ estado: EstadoDevolucion; nota: string }>) =>
    setRevision((a) => ({ ...a, [id]: { ...a[id], ...cambio } }));

  return (
    <TarjetaBase solicitud={solicitud}>
      <Typography sx={{ fontWeight: 800 }}>¿Cómo regresó cada cosa?</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {entregados.map((r) => {
          const actual = revision[r.articuloId];
          const mal = actual?.estado === 'con-problema';
          return (
            <Box key={r.articuloId} sx={{ p: 1.5, borderRadius: '18px', bgcolor: mal ? colores.rosa : colores.papel, transition: 'background .2s ease' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{ flex: '1 1 200px', fontWeight: 800 }}>
                  {r.cantidad} × {r.nombre}
                </Box>
                <Box role="group" aria-label={`Estado de ${r.nombre}`} sx={{ display: 'flex', gap: 0.75 }}>
                  <Button
                    onClick={() => cambiar(r.articuloId, { estado: 'bien' })}
                    aria-pressed={!mal}
                    startIcon={<Iconify icon="biolab:paloma" width={16} />}
                    sx={{ borderRadius: 99, px: 1.75, bgcolor: !mal ? colores.verde : colores.crema, color: !mal ? colores.crema : colores.bosque, '&:hover': { bgcolor: !mal ? colores.bosque : colores.menta } }}
                  >
                    Bien
                  </Button>
                  <Button
                    onClick={() => cambiar(r.articuloId, { estado: 'con-problema' })}
                    aria-pressed={mal}
                    startIcon={<Iconify icon="biolab:alerta" width={16} />}
                    sx={{ borderRadius: 99, px: 1.75, bgcolor: mal ? colores.tinto : colores.crema, color: mal ? colores.crema : colores.bosque, '&:hover': { bgcolor: mal ? colores.tintoClaro : colores.rosa } }}
                  >
                    Con problema
                  </Button>
                </Box>
              </Box>
              {mal && (
                <TextField
                  value={actual.nota}
                  onChange={(e) => cambiar(r.articuloId, { nota: e.target.value })}
                  label="¿Qué pasó?"
                  placeholder="Ej. regresó con el lente rayado / faltó 1 pieza"
                  required
                  fullWidth
                  multiline
                  minRows={2}
                  sx={{ mt: 1.25, bgcolor: colores.crema, borderRadius: 2, animation: `${brincar} .35s both` }}
                />
              )}
            </Box>
          );
        })}
      </Box>
      <Button
        disabled={guardando || faltaNota}
        onClick={async () => {
          setGuardando(true);
          try {
            await onRegistrar(revision);
          } finally {
            setGuardando(false);
          }
        }}
        startIcon={<Iconify icon={conProblema.length > 0 ? 'biolab:reporte' : 'biolab:paloma'} />}
        sx={{ alignSelf: 'flex-start', borderRadius: 99, minHeight: 50, px: 3, bgcolor: conProblema.length > 0 ? colores.tinto : colores.verde, color: colores.crema, '&:hover': { bgcolor: conProblema.length > 0 ? colores.tintoClaro : colores.bosque }, '&.Mui-disabled': { bgcolor: colores.salvia, color: colores.crema } }}
      >
        {conProblema.length > 0 ? 'Registrar y mandar reporte' : 'Todo regresó bien'}
      </Button>
      {faltaNota && <Typography variant="body2" sx={{ fontWeight: 700, color: colores.tinto }}>Escribe una nota en lo que tiene problema.</Typography>}
    </TarjetaBase>
  );
}
