import type { Practica, TipoMaterial, SolicitudMaterial, ArticuloInventario, CategoriaInventario } from 'src/tipos/dominio';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSearchParams } from 'react-router';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { RouterLink } from 'src/routes/components';

import { Capi } from 'src/componentes/capi';
import { useSesion } from 'src/contexto/sesion';
import { useDatos } from 'src/ganchos/usar-datos';
import { DashboardContent } from 'src/layouts/dashboard';
import { Confeti, Tarjeta, ChipEstado, EncabezadoPagina } from 'src/componentes/comunes';
import { colores, brincar, escanear, sxAparecer, sombraSuave, fuenteTitulos } from 'src/componentes/estilos';
import { crearSolicitud, ventanaParaPedir, obtenerSolicitudes, obtenerMisPracticas, obtenerInventarioTodo, obtenerDisponibilidad } from 'src/servicios';

import { Iconify } from 'src/components/iconify';

import { horarioPractica, aparienciaSolicitud } from '../compartido/apariencia';
import { tiposMaterial, ExploradorInventario } from '../compartido/explorador-inventario';

import type { VistaArticulos } from '../compartido/explorador-inventario';

// ----------------------------------------------------------------------
// Alumno: pide material para su equipo (una semana antes de la práctica).
// Después ve el estado: esperando → QR de aprobación → entregado → devuelto.
// ----------------------------------------------------------------------

export function VistaPrestamo() {
  const { usuario } = useSesion();
  const [parametros, setParametros] = useSearchParams();

  const { datos } = useDatos(() => obtenerMisPracticas(usuario.id), [usuario.id]);
  const equipo = datos?.equipo ?? null;
  const { datos: solicitudes, setDatos: setSolicitudes, recargar } = useDatos(
    () => (equipo ? obtenerSolicitudes({ equipoId: equipo.id }) : Promise.resolve([])),
    [equipo?.id]
  );

  // Se puede pedir para prácticas con la ventana abierta, o ver las que ya tienen solicitud
  const practicas = (datos?.practicas ?? []).filter(
    (p) => ventanaParaPedir(p).estado === 'abierta' || solicitudes?.some((s) => s.practicaId === p.id && s.renglones.length > 0)
  );
  const practicaId = parametros.get('practica') ?? practicas[0]?.id ?? null;
  const practica = practicas.find((p) => p.id === practicaId) ?? null;
  const solicitud = solicitudes?.find((s) => s.practicaId === practicaId) ?? null;

  return (
    <DashboardContent maxWidth="lg">
      <EncabezadoPagina
        antetitulo={equipo ? `${equipo.nombre} · Grupo ${equipo.grupo}` : 'Material para tu equipo'}
        titulo="Pedir material"
        descripcion="Pides una vez por equipo. El laboratorista revisa y te manda un QR para recogerlo."
      />

      {datos && practicas.length === 0 && (
        <Tarjeta sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2.5 }}>
          <Capi ancho={120} />
          <Box sx={{ flex: '1 1 260px' }}>
            <Typography sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>Aún no puedes pedir material</Typography>
            <Typography sx={{ fontWeight: 600, color: colores.verde }}>Se abre una semana antes de cada práctica de tu equipo.</Typography>
            <Button component={RouterLink} href="/mis-practicas" sx={{ mt: 1.5, borderRadius: 99, px: 2.5, bgcolor: colores.bosque, color: colores.crema, '&:hover': { bgcolor: colores.verde } }}>
              Ver mis prácticas
            </Button>
          </Box>
        </Tarjeta>
      )}

      {practicas.length > 1 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5, ...sxAparecer(0.08) }}>
          {practicas.map((p) => (
            <Button
              key={p.id}
              onClick={() => setParametros({ practica: p.id })}
              aria-pressed={p.id === practicaId}
              sx={{ borderRadius: 99, px: 2.25, minHeight: 46, bgcolor: p.id === practicaId ? colores.bosque : colores.crema, color: p.id === practicaId ? colores.crema : colores.bosque, boxShadow: p.id === practicaId ? 'none' : sombraSuave }}
            >
              {p.nombre}
            </Button>
          ))}
        </Box>
      )}

      {/* Al crear la práctica ya existe una petición vacía por equipo: mientras no tenga materiales se puede pedir */}
      {practica && equipo && (!solicitud || solicitud.renglones.length === 0) && (
        <FormularioSolicitud
          practica={practica}
          equipoId={equipo.id}
          onEnviar={async (renglones) => {
            const nueva = await crearSolicitud({ practicaId: practica.id, equipoId: equipo.id, renglones }, usuario);
            setSolicitudes((anteriores) => [nueva, ...(anteriores ?? []).filter((s) => s.id !== nueva.id)]);
          }}
        />
      )}

      {practica && solicitud && solicitud.renglones.length > 0 && <EstadoSolicitud solicitud={solicitud} practica={practica} onActualizar={recargar} />}
    </DashboardContent>
  );
}

// ---------------------------- Pedir ----------------------------

/** Para buscar sin importar mayúsculas ni acentos */
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * El equipo pide su material con el mismo explorador del inventario (pestañas por categoría,
 * tipo de material y búsqueda). Cada artículo muestra cuánto hay disponible para el horario
 * de la práctica y no deja pedir más; lo agotado, en uso o ya apartado sale bloqueado.
 */
function FormularioSolicitud({ practica, equipoId, onEnviar }: { practica: Practica; equipoId: string; onEnviar: (renglones: { articuloId: string; cantidad: number }[]) => Promise<void> }) {
  const { datos: materiales } = useDatos(obtenerInventarioTodo);
  const { datos: disponibilidad, error: errorDisponibilidad } = useDatos(() => obtenerDisponibilidad(practica.id, equipoId), [practica.id, equipoId]);
  const [categoria, setCategoria] = useState<CategoriaInventario>('consumibles');
  const [vista, setVista] = useState<VistaArticulos>('lista');
  const [tipo, setTipo] = useState<TipoMaterial | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const elegidos = Object.entries(cantidades).filter(([, c]) => c > 0);
  const nombreDe = (id: string) => materiales?.find((m) => m.id === id)?.nombre ?? id;

  /** Lo máximo que se puede pedir de un artículo: lo disponible (con datos reales) o un tope fijo (datos de ejemplo) */
  const maximoDe = (articulo: ArticuloInventario) => {
    const d = disponibilidad?.[articulo.id];
    if (d) return d.disponible;
    if (disponibilidad === null) return articulo.categoria === 'equipo' ? 1 : 10;
    return 0;
  };

  const cambiar = (id: string, delta: number, maximo: number) =>
    setCantidades((a) => ({ ...a, [id]: Math.max(0, Math.min(maximo, (a[id] ?? 0) + delta)) }));

  const delaCategoria = (materiales ?? []).filter((m) => m.categoria === categoria);
  const visibles = delaCategoria
    .filter((m) => categoria !== 'utensilios' || tipo === 'todos' || m.tipoMaterial === tipo)
    .filter((m) => busqueda.trim() === '' || normalizar(m.nombre).includes(normalizar(busqueda)));

  const enviar = async () => {
    setEnviando(true);
    setError(null);
    try {
      await onEnviar(elegidos.map(([articuloId, cantidad]) => ({ articuloId, cantidad })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, ...sxAparecer(0.1) }}>
        <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>
          ¿Qué necesita tu equipo para {practica.nombre}?
        </Typography>
        <ChipEstado texto={horarioPractica(practica.inicio, practica.duracionHoras, practica.fin)} icono="biolab:reloj" fondo={colores.papelOscuro} color={colores.bosque} />
      </Box>

      {error && <Alert severity="error" sx={{ borderRadius: '16px' }}>{error}</Alert>}
      {errorDisponibilidad && (
        <Alert severity="warning" sx={{ borderRadius: '16px' }}>
          No se pudo consultar la disponibilidad. Puedes seguir, pero el laboratorio la vuelve a comprobar al enviar.
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, alignItems: 'flex-start' }}>
        <Box sx={{ flex: '3 1 520px', minWidth: 0 }}>
          <ExploradorInventario
            categoria={categoria}
            onCambiarCategoria={(nueva) => {
              setCategoria(nueva);
              setBusqueda('');
            }}
            articulos={materiales ? visibles : null}
            vista={vista}
            onCambiarVista={setVista}
            resaltar={(articulo) => (cantidades[articulo.id] ?? 0) > 0}
            contador={(cat) => elegidos.filter(([id]) => materiales?.find((m) => m.id === id)?.categoria === cat).length}
            arriba={
              <>
                <TextField
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder={`Buscar en ${categoria === 'consumibles' ? 'consumibles y reactivos' : categoria === 'equipo' ? 'equipo' : 'materiales'}…`}
                  size="small"
                  fullWidth
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Iconify icon="eva:search-fill" width={18} /></InputAdornment> } }}
                  sx={{ bgcolor: colores.papel, borderRadius: 2 }}
                />
                {categoria === 'utensilios' && (
                  <Box role="group" aria-label="Tipo de material" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {[{ id: 'todos' as const, nombre: 'Todos' }, ...tiposMaterial].map((t) => {
                      const activo = tipo === t.id;
                      const total = delaCategoria.filter((m) => t.id === 'todos' || m.tipoMaterial === t.id).length;
                      return (
                        <Button
                          key={t.id}
                          onClick={() => setTipo(t.id)}
                          aria-pressed={activo}
                          sx={{ borderRadius: 99, px: 2, minHeight: 40, bgcolor: activo ? colores.bosque : colores.papel, color: activo ? colores.crema : colores.bosque, '&:hover': { bgcolor: activo ? colores.verde : colores.papelOscuro } }}
                        >
                          {t.nombre} · {total}
                        </Button>
                      );
                    })}
                  </Box>
                )}
              </>
            }
            acciones={(articulo) => {
              const cantidad = cantidades[articulo.id] ?? 0;
              const maximo = maximoDe(articulo);
              const d = disponibilidad?.[articulo.id];
              const bloqueado = maximo === 0;

              if (bloqueado) {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.75, borderRadius: 99, bgcolor: colores.rosa, color: colores.tinto, fontWeight: 800, fontSize: 14 }}>
                    <Iconify icon="biolab:prohibido" width={16} />
                    {d?.motivo ?? 'No disponible'}
                  </Box>
                );
              }

              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <IconButton aria-label={`Quitar ${articulo.nombre}`} onClick={() => cambiar(articulo.id, -1, maximo)} disabled={cantidad === 0} sx={{ bgcolor: colores.crema, width: 40, height: 40 }}>
                      <Box component="span" sx={{ fontWeight: 900, fontSize: 22, lineHeight: 1 }}>−</Box>
                    </IconButton>
                    <Box sx={{ minWidth: 28, textAlign: 'center', fontWeight: 900, fontSize: 20 }} aria-live="polite">{cantidad}</Box>
                    <IconButton
                      aria-label={`Agregar ${articulo.nombre}`}
                      onClick={() => cambiar(articulo.id, 1, maximo)}
                      disabled={cantidad >= maximo}
                      sx={{ bgcolor: colores.verde, color: colores.crema, width: 40, height: 40, '&:hover': { bgcolor: colores.bosque } }}
                    >
                      <Iconify icon="biolab:mas" width={20} />
                    </IconButton>
                  </Box>
                  {d && (
                    <Typography variant="caption" sx={{ fontWeight: 800, color: cantidad >= maximo ? colores.tinto : colores.verde }}>
                      {cantidad >= maximo ? `Es todo lo que hay (${maximo})` : `Disponibles: ${maximo}`}
                    </Typography>
                  )}
                </Box>
              );
            }}
          />
        </Box>

        {/* Resumen de la solicitud, siempre a la vista */}
        <Box sx={{ flex: '1 1 260px', position: { md: 'sticky' }, top: { md: 90 }, bgcolor: colores.salviaClara, borderRadius: '28px', p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, ...sxAparecer(0.16) }}>
          <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 22 }}>Tu solicitud</Typography>
          {elegidos.length === 0 ? (
            <Typography sx={{ fontWeight: 700 }}>Usa el botón + en cada cosa que necesite tu equipo.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {elegidos.map(([id, cantidad]) => (
                <Box key={id} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderRadius: '14px', bgcolor: colores.crema, fontWeight: 800, animation: `${brincar} .35s both` }}>
                  <Box component="span" sx={{ minWidth: 28, color: colores.verde }}>{cantidad}×</Box>
                  <Box component="span" sx={{ flex: 1 }}>{nombreDe(id)}</Box>
                </Box>
              ))}
            </Box>
          )}
          <Button
            onClick={enviar}
            disabled={elegidos.length === 0 || enviando}
            size="large"
            startIcon={<Iconify icon="biolab:enviar" />}
            sx={{ borderRadius: 99, minHeight: 54, fontSize: 16, bgcolor: colores.verde, color: colores.crema, boxShadow: '0 14px 28px -14px rgba(90,31,55,.7)', '&:hover': { bgcolor: colores.bosque }, '&.Mui-disabled': { bgcolor: colores.crema, color: colores.verde, boxShadow: 'none' } }}
          >
            {enviando ? 'Enviando…' : 'Enviar al laboratorista'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// ---------------------------- Estado de la solicitud ----------------------------

function EstadoSolicitud({ solicitud, practica, onActualizar }: { solicitud: SolicitudMaterial; practica: Practica; onActualizar: () => void }) {
  const apariencia = aparienciaSolicitud[solicitud.estado];

  const mensajes: Record<SolicitudMaterial['estado'], { titulo: string; texto: string }> = {
    pendiente: { titulo: 'Esperando al laboratorista', texto: 'Ya le llegó tu solicitud. En cuanto la revise, aquí aparece tu QR.' },
    aprobada: { titulo: 'Muéstrale este QR al laboratorista', texto: 'Lo escanea y te entrega lo que aprobó. Al terminar la práctica, regresas todo.' },
    rechazada: { titulo: 'Esta vez no se pudo', texto: 'El laboratorista no aprobó el material. Habla con tu profesor.' },
    entregada: { titulo: '¡Material en tus manos!', texto: 'Cuídalo mucho y regrésalo al terminar la práctica. El laboratorista revisará cómo vuelve.' },
    devuelta: { titulo: 'Todo regresó bien', texto: 'Gracias por cuidar el material. Tu racha sube y Capi gana una mandarina.' },
    'con-problemas': { titulo: 'Hubo un problema con el material', texto: 'El laboratorista dejó notas abajo. La coordinación ya recibió el reporte.' },
  };
  const mensaje = mensajes[solicitud.estado];
  const celebrar = solicitud.estado === 'entregada' || solicitud.estado === 'devuelta';

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: solicitud.estado === 'con-problemas' ? colores.rosa : colores.salviaClara, borderRadius: '34px', p: { xs: 3, md: 4 }, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3.5, animation: `${brincar} .45s both` }}>
      {celebrar && <Confeti />}

      {solicitud.estado === 'aprobada' && solicitud.codigoQr ? (
        <Box sx={{ bgcolor: colores.crema, borderRadius: '28px', p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box sx={{ position: 'relative', p: 1, borderRadius: '16px', overflow: 'hidden' }}>
            <QRCodeSVG value={solicitud.codigoQr} size={220} fgColor={colores.bosque} bgColor={colores.crema} level="M" />
            <Box aria-hidden sx={{ position: 'absolute', left: 4, right: 4, top: 8, height: 4, borderRadius: '4px', bgcolor: colores.tintoClaro, boxShadow: '0 0 14px 4px rgba(133,73,73,.35)', animation: `${escanear} 2.6s ease-in-out infinite` }} />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: colores.verde }}>{solicitud.codigoQr}</Typography>
        </Box>
      ) : (
        <Capi animo={solicitud.estado === 'con-problemas' || solicitud.estado === 'rechazada' ? 'triste' : celebrar ? 'celebrando' : 'feliz'} ancho={180} flotando />
      )}

      <Box sx={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative' }}>
        <ChipEstado {...apariencia} />
        <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 32, lineHeight: 1.1 }}>{mensaje.titulo}</Typography>
        <Typography sx={{ fontSize: 17, fontWeight: 600 }}>{mensaje.texto}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 800, color: colores.verde }}>
          {practica.nombre} · {horarioPractica(practica.inicio, practica.duracionHoras, practica.fin)} · pidió {solicitud.solicitanteNombre}
        </Typography>

        <Box sx={{ bgcolor: colores.crema, borderRadius: '20px', p: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {solicitud.renglones.map((r) => {
            const rechazado = r.aceptado === false;
            const problema = r.devolucion?.estado === 'con-problema';
            return (
              <Box key={r.articuloId}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, color: rechazado ? colores.tintoClaro : colores.bosque, textDecoration: rechazado ? 'line-through' : 'none' }}>
                  <Iconify icon={r.aceptado === null ? 'biolab:reloj' : rechazado || problema ? 'biolab:cruz' : 'biolab:paloma'} width={18} sx={{ color: rechazado || problema ? colores.tinto : colores.verde }} />
                  {r.cantidad} × {r.nombre}
                  {rechazado && <Box component="span" sx={{ fontWeight: 700, textDecoration: 'none' }}> · no aprobado</Box>}
                </Box>
                {problema && r.devolucion?.nota && (
                  <Typography variant="body2" sx={{ ml: 3.25, fontWeight: 700, color: colores.tinto }}>Nota: {r.devolucion.nota}</Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {(solicitud.estado === 'pendiente' || solicitud.estado === 'aprobada') && (
          <Button onClick={onActualizar} startIcon={<Iconify icon="solar:restart-bold" />} sx={{ alignSelf: 'flex-start', borderRadius: 99, px: 2.5, bgcolor: colores.crema, color: colores.bosque }}>
            Actualizar estado
          </Button>
        )}
      </Box>
    </Box>
  );
}
