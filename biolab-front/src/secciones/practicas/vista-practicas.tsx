import type { Practica, NuevoEquipo, EquipoAlumnos } from 'src/tipos/dominio';

import { useState } from 'react';
import { useSearchParams } from 'react-router';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useSesion } from 'src/contexto/sesion';
import { useDatos } from 'src/ganchos/usar-datos';
import { DashboardContent } from 'src/layouts/dashboard';
import { seEmpalman, finDePractica } from 'src/utilidades/horario';
import { Tarjeta, ChipEstado, EncabezadoPagina } from 'src/componentes/comunes';
import { colores, brincar, sxAparecer, sxLevantar, sombraSuave, fuenteTitulos } from 'src/componentes/estilos';
import { crearEquipo, borrarEquipo, crearPractica, obtenerAlumnos, borrarPractica, obtenerEquipos, obtenerPracticas, obtenerAsignaciones } from 'src/servicios';

import { Iconify } from 'src/components/iconify';

import { horarioPractica, aparienciaLaboratorio } from '../compartido/apariencia';

// ----------------------------------------------------------------------
// Profesor: registra sus equipos de alumnos (a principio de semestre) y crea
// prácticas con día, hora, laboratorio y los equipos que la harán.
// El material NO lo pone el profe: lo piden los equipos.
// ----------------------------------------------------------------------

type Pestana = 'practicas' | 'equipos';

export function VistaPracticas() {
  const [parametros, setParametros] = useSearchParams();
  const [pestana, setPestana] = useState<Pestana>('practicas');
  const { usuario } = useSesion();

  const { datos: practicas, setDatos: setPracticas } = useDatos(obtenerPracticas);
  const { datos: equipos, setDatos: setEquipos } = useDatos(obtenerEquipos);

  const formularioAbierto = parametros.get('nueva') === '1';
  const abrirFormulario = () => setParametros({ nueva: '1' });
  const cerrarFormulario = () => setParametros({});

  const ahora = new Date();
  const proximas = (practicas ?? []).filter((p) => new Date(p.inicio) >= ahora);
  const pasadas = (practicas ?? []).filter((p) => new Date(p.inicio) < ahora).reverse();

  return (
    <DashboardContent maxWidth="lg">
      <EncabezadoPagina
        antetitulo="Organiza tu semestre"
        titulo="Prácticas y equipos"
        descripcion="Registra tus equipos una vez; luego crea cada práctica y elige qué equipos la hacen."
      />

      <Box role="tablist" sx={{ display: 'inline-flex', gap: 0.5, p: 0.625, mb: 3, borderRadius: 99, bgcolor: colores.crema, boxShadow: sombraSuave, ...sxAparecer(0.08) }}>
        {(
          [
            ['practicas', 'Prácticas', 'biolab:calendario'],
            ['equipos', 'Equipos de alumnos', 'biolab:usuarios'],
          ] as const
        ).map(([valor, texto, icono]) => (
          <Button
            key={valor}
            role="tab"
            aria-selected={pestana === valor}
            onClick={() => setPestana(valor)}
            startIcon={<Iconify icon={icono} width={18} />}
            sx={{ borderRadius: 99, px: 2.5, minHeight: 46, bgcolor: pestana === valor ? colores.bosque : 'transparent', color: pestana === valor ? colores.crema : colores.bosque, '&:hover': { bgcolor: pestana === valor ? colores.verde : colores.papel } }}
          >
            {texto}
          </Button>
        ))}
      </Box>

      {pestana === 'practicas' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {formularioAbierto ? (
            <FormularioPractica
              equipos={equipos ?? []}
              practicas={practicas ?? []}
              fechaInicial={parametros.get('fecha') ?? ''}
              horaInicial={Number(parametros.get('hora') ?? 10)}
              onCancelar={cerrarFormulario}
              onGuardar={async (nueva) => {
                const creada = await crearPractica(nueva, usuario.id);
                setPracticas((anteriores) => [...(anteriores ?? []), creada].sort((a, b) => a.inicio.localeCompare(b.inicio)));
                cerrarFormulario();
              }}
              onIrAEquipos={() => {
                cerrarFormulario();
                setPestana('equipos');
              }}
            />
          ) : (
            <Button
              onClick={abrirFormulario}
              size="large"
              startIcon={<Iconify icon="biolab:mas" />}
              sx={{ alignSelf: 'flex-start', borderRadius: 99, minHeight: 54, px: 3, fontSize: 17, bgcolor: colores.verde, color: colores.crema, boxShadow: '0 14px 28px -14px rgba(90,31,55,.7)', '&:hover': { bgcolor: colores.bosque } }}
            >
              Nueva práctica
            </Button>
          )}

          <ListaPracticas titulo="Próximas" practicas={proximas} equipos={equipos ?? []} onBorrar={async (id) => {
            setPracticas((anteriores) => anteriores?.filter((p) => p.id !== id) ?? null);
            await borrarPractica(id);
          }} />
          {pasadas.length > 0 && <ListaPracticas titulo="Ya pasaron" practicas={pasadas} equipos={equipos ?? []} atenuadas />}
        </Box>
      )}

      {pestana === 'equipos' && (
        <SeccionEquipos
          equipos={equipos ?? []}
          onCrear={async (nuevo) => {
            const creado = await crearEquipo(nuevo, usuario.id);
            setEquipos((anteriores) => [...(anteriores ?? []), creado]);
          }}
          onBorrar={async (id) => {
            setEquipos((anteriores) => anteriores?.filter((e) => e.id !== id) ?? null);
            await borrarEquipo(id);
          }}
        />
      )}
    </DashboardContent>
  );
}

// ---------------------------- Prácticas ----------------------------

type ListaPracticasProps = {
  titulo: string;
  practicas: Practica[];
  equipos: EquipoAlumnos[];
  atenuadas?: boolean;
  onBorrar?: (id: string) => void;
};

function ListaPracticas({ titulo, practicas, equipos, atenuadas, onBorrar }: ListaPracticasProps) {
  return (
    <Box sx={sxAparecer(0.14)}>
      <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24, mb: 1.5 }}>
        {titulo}
      </Typography>
      {practicas.length === 0 && <Typography sx={{ fontWeight: 600, color: colores.verde }}>Todavía no hay prácticas aquí.</Typography>}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
        {practicas.map((practica) => {
          const lab = aparienciaLaboratorio[practica.laboratorioId];
          const nombresEquipos = practica.equipoIds.map((id) => equipos.find((e) => e.id === id)?.nombre ?? id);
          return (
            <Box key={practica.id} sx={{ bgcolor: colores.crema, borderRadius: '24px', boxShadow: sombraSuave, p: 2.25, display: 'flex', flexDirection: 'column', gap: 1.25, opacity: atenuadas ? 0.7 : 1, ...sxLevantar }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ width: 46, height: 46, borderRadius: '16px', bgcolor: lab.fondo, color: lab.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Iconify icon={lab.icono} width={24} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 20, lineHeight: 1.2 }}>{practica.nombre}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colores.verde }}>
                    {lab.nombre} · Grupo {practica.grupo}
                  </Typography>
                </Box>
                {onBorrar && (
                  <IconButton aria-label={`Borrar ${practica.nombre}`} onClick={() => onBorrar(practica.id)} sx={{ color: colores.tintoClaro }}>
                    <Iconify icon="biolab:basura" width={18} />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
                <Iconify icon="biolab:reloj" width={18} sx={{ color: colores.verde }} />
                {horarioPractica(practica.inicio, practica.duracionHoras, practica.fin)}
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {nombresEquipos.map((nombre) => (
                  <ChipEstado key={nombre} texto={nombre} icono="biolab:usuarios" fondo={colores.menta} color="#6E2643" />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

type FormularioPracticaProps = {
  equipos: EquipoAlumnos[];
  /** Prácticas ya creadas, para no poner a un equipo en dos a la vez */
  practicas: Practica[];
  fechaInicial: string;
  horaInicial: number;
  onGuardar: (nueva: Omit<Practica, 'id' | 'profesorId' | 'profesorNombre'>) => Promise<void>;
  onCancelar: () => void;
  onIrAEquipos: () => void;
};

const HORA_MS = 3_600_000;
const sxCampo = { bgcolor: colores.crema, borderRadius: 2 } as const;

/** Date → "2026-11-10T10:00" para un input datetime-local */
function aLocal(fecha: Date) {
  const d = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${d(fecha.getMonth() + 1)}-${d(fecha.getDate())}T${d(fecha.getHours())}:${d(fecha.getMinutes())}`;
}

/** Inicio sugerido: el día y la hora que llegaron del calendario, o mañana a las 10 */
function inicioSugerido(fecha: string, hora: number) {
  const base = fecha ? new Date(`${fecha}T00:00`) : new Date(Date.now() + 24 * HORA_MS);
  base.setHours(fecha ? hora : 10, 0, 0, 0);
  return base;
}

function FormularioPractica({ equipos, practicas, fechaInicial, horaInicial, onGuardar, onCancelar, onIrAEquipos }: FormularioPracticaProps) {
  const grupos = Array.from(new Set(equipos.map((e) => e.grupo))).sort();
  const sugerido = inicioSugerido(fechaInicial, horaInicial);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [inicio, setInicio] = useState(aLocal(sugerido));
  const [fin, setFin] = useState(aLocal(new Date(sugerido.getTime() + 2 * HORA_MS)));
  const [grupo, setGrupo] = useState(grupos[0] ?? '');
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fechaInicio = inicio ? new Date(inicio) : null;
  const fechaFin = fin ? new Date(fin) : null;

  let errorFechas: string | null = null;
  if (!fechaInicio || !fechaFin) errorFechas = 'Pon la fecha de inicio y la final';
  else if (fechaInicio.getTime() < Date.now()) errorFechas = 'La práctica no puede empezar en el pasado';
  else if (fechaFin <= fechaInicio) errorFechas = 'La fecha final debe ser después del inicio';
  else if (fechaFin.getTime() - fechaInicio.getTime() > 12 * HORA_MS) errorFechas = 'Una práctica dura máximo 12 horas';

  /** Equipos que ya tienen otra práctica en ese horario */
  const ocupados = new Set(
    fechaInicio && fechaFin && !errorFechas
      ? practicas
          .filter((p) => seEmpalman({ inicio: fechaInicio, fin: fechaFin }, { inicio: new Date(p.inicio), fin: finDePractica(p) }))
          .flatMap((p) => p.equipoIds)
      : [],
  );

  const equiposDelGrupo = equipos.filter((e) => e.grupo === grupo);
  const listo = nombre.trim() !== '' && !errorFechas && elegidos.length > 0 && elegidos.every((id) => !ocupados.has(id));

  const alternar = (id: string) => setElegidos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!listo || !fechaInicio || !fechaFin) return;
    setGuardando(true);
    setError(null);
    try {
      await onGuardar({
        nombre: nombre.trim(),
        grupo,
        // El esquema no guarda laboratorio: se usa uno fijo para la UI
        laboratorioId: 'microbiologia',
        inicio: fechaInicio.toISOString(),
        fin: fechaFin.toISOString(),
        duracionHoras: Math.round(((fechaFin.getTime() - fechaInicio.getTime()) / HORA_MS) * 10) / 10,
        descripcion: descripcion.trim() || undefined,
        equipoIds: elegidos,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la práctica');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Tarjeta sx={{ bgcolor: colores.menta, animation: `${brincar} .45s both` }}>
      <Box component="form" onSubmit={guardar} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>
          Nueva práctica
        </Typography>

        <TextField label="Nombre de la práctica" placeholder="Ej. Siembra de cultivos" value={nombre} onChange={(e) => setNombre(e.target.value)} required slotProps={{ htmlInput: { maxLength: 100 } }} sx={sxCampo} />

        <TextField label="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} multiline minRows={2} slotProps={{ htmlInput: { maxLength: 255 } }} helperText={`${descripcion.length}/255`} sx={sxCampo} />

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1.5 }}>
          <TextField
            type="datetime-local"
            label="Fecha y hora de inicio"
            value={inicio}
            onChange={(e) => {
              const nuevo = e.target.value;
              // Al mover el inicio se conserva la duración elegida
              if (nuevo && fechaInicio && fechaFin && fechaFin > fechaInicio) {
                setFin(aLocal(new Date(new Date(nuevo).getTime() + (fechaFin.getTime() - fechaInicio.getTime()))));
              }
              setInicio(nuevo);
            }}
            required
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 900 } }}
            sx={sxCampo}
          />
          <TextField
            type="datetime-local"
            label="Fecha y hora final"
            value={fin}
            onChange={(e) => setFin(e.target.value)}
            required
            error={!!errorFechas && !!inicio && !!fin}
            helperText={errorFechas ?? (fechaInicio && fechaFin ? `Dura ${Math.round(((fechaFin.getTime() - fechaInicio.getTime()) / HORA_MS) * 10) / 10} h · se registra en Horarios` : ' ')}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 900 } }}
            sx={sxCampo}
          />
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 800, mb: 1 }}>¿Qué equipo la realiza?</Typography>
          {grupos.length === 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontWeight: 600 }}>Primero registra tus equipos de alumnos.</Typography>
              <Button onClick={onIrAEquipos} sx={{ borderRadius: 99, px: 2, bgcolor: colores.crema, color: colores.bosque }}>Ir a equipos</Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                {grupos.map((g) => (
                  <Button
                    key={g}
                    onClick={() => {
                      setGrupo(g);
                      setElegidos([]);
                    }}
                    aria-pressed={grupo === g}
                    sx={{ borderRadius: 99, px: 2, bgcolor: grupo === g ? colores.bosque : colores.crema, color: grupo === g ? colores.crema : colores.bosque, '&:hover': { bgcolor: grupo === g ? colores.verde : colores.papel } }}
                  >
                    Grupo {g}
                  </Button>
                ))}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1.25 }}>
                {equiposDelGrupo.map((equipo) => {
                  const elegido = elegidos.includes(equipo.id);
                  const ocupado = ocupados.has(equipo.id);
                  return (
                    <ButtonBase
                      key={equipo.id}
                      onClick={() => alternar(equipo.id)}
                      disabled={ocupado && !elegido}
                      aria-pressed={elegido}
                      sx={{ justifyContent: 'flex-start', alignItems: 'flex-start', gap: 1.25, p: 1.5, borderRadius: '18px', textAlign: 'left', bgcolor: ocupado ? colores.rojoSuave : colores.crema, opacity: ocupado && !elegido ? 0.7 : 1, boxShadow: elegido ? `inset 0 0 0 3px ${ocupado ? colores.tinto : colores.verde}` : 'none' }}
                    >
                      <Box sx={{ width: 26, height: 26, borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: elegido ? colores.verde : colores.papelOscuro, color: colores.crema }}>
                        {elegido && <Iconify icon="biolab:paloma" width={16} />}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800 }}>{equipo.nombre}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: ocupado ? colores.tinto : colores.verde }}>
                          {ocupado ? 'Ya tiene otra práctica en ese horario' : equipo.integrantes.map((i) => i.nombre).join(', ')}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  );
                })}
              </Box>
            </>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ borderRadius: '16px' }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
          <Button type="submit" disabled={!listo || guardando} sx={{ borderRadius: 99, px: 3, minHeight: 48, bgcolor: colores.verde, color: colores.crema, '&:hover': { bgcolor: colores.bosque }, '&.Mui-disabled': { bgcolor: colores.salvia, color: colores.crema } }}>
            {guardando ? 'Guardando…' : 'Crear práctica'}
          </Button>
          <Button onClick={onCancelar} sx={{ borderRadius: 99, px: 3, minHeight: 48, bgcolor: colores.crema, color: colores.bosque }}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Tarjeta>
  );
}

// ---------------------------- Equipos ----------------------------

type SeccionEquiposProps = {
  equipos: EquipoAlumnos[];
  onCrear: (nuevo: NuevoEquipo) => Promise<void>;
  onBorrar: (id: string) => void;
};

function SeccionEquipos({ equipos, onCrear, onBorrar }: SeccionEquiposProps) {
  const { usuario } = useSesion();
  const { datos: todasAsignaciones } = useDatos(obtenerAsignaciones);
  const { datos: alumnos } = useDatos(obtenerAlumnos);

  // Solo las materias que coordinación le asignó a este profesor, por grupo
  const opciones = (todasAsignaciones ?? [])
    .filter((a) => a.profesorUsuarioId === usuario.id)
    .flatMap((a) => a.grupos.map((g) => ({ clave: `${a.id}-${g.id}`, asignacionId: a.id, materia: a.materia, grupo: g })));

  const [clave, setClave] = useState('');
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opcion = opciones.find((o) => o.clave === clave);
  const ocupados = new Set(equipos.flatMap((e) => e.integrantes.map((i) => i.id)));
  const disponibles = (alumnos ?? []).filter((a) => opcion && a.grupoId === opcion.grupo.id);
  const listo = !!opcion && elegidos.length > 0;
  const grupos = Array.from(new Set(equipos.map((e) => e.grupo))).sort();

  const alternar = (id: string) =>
    setElegidos((actuales) => (actuales.includes(id) ? actuales.filter((x) => x !== id) : [...actuales, id]));

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!opcion || !listo) return;
    setGuardando(true);
    setError(null);
    try {
      const delGrupo = equipos.filter((e) => e.grupo === opcion.grupo.nombre).length;
      await onCrear({
        nombre: `Equipo ${delGrupo + 1}`,
        grupo: opcion.grupo.nombre,
        asignacionId: opcion.asignacionId,
        grupoId: opcion.grupo.id,
        integrantes: disponibles
          .filter((a) => elegidos.includes(String(a.id)))
          .map((a) => ({ id: String(a.id), nombre: a.nombre })),
      });
      setElegidos([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el equipo');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, alignItems: 'flex-start' }}>
      <Tarjeta sx={{ flex: '1 1 300px', bgcolor: colores.menta }} retraso={0.1}>
        <Box component="form" onSubmit={guardar} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 22 }}>Registrar equipo</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: colores.verde }}>Se hace una vez a principio de semestre.</Typography>
          {todasAsignaciones && opciones.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: '16px' }}>
              Aún no tienes materias con grupo asignado. Pide a coordinación o al laboratorio que te las asignen en Materias.
            </Alert>
          ) : (
            <TextField
              select
              label="Materia y grupo"
              value={clave}
              onChange={(e) => {
                setClave(e.target.value);
                setElegidos([]);
              }}
              sx={{ bgcolor: colores.crema, borderRadius: 2 }}
            >
              {opciones.map((o) => (
                <MenuItem key={o.clave} value={o.clave}>
                  {o.materia} · Grupo {o.grupo.nombre}
                </MenuItem>
              ))}
            </TextField>
          )}
          {opcion && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 280, overflowY: 'auto', p: 1, borderRadius: '16px', bgcolor: colores.crema }}>
              {disponibles.length === 0 && (
                <Typography variant="body2" sx={{ p: 1, fontWeight: 600, color: colores.verde }}>
                  No hay alumnos registrados en el grupo {opcion.grupo.nombre}.
                </Typography>
              )}
              {disponibles.map((a) => {
                const id = String(a.id);
                const enOtro = ocupados.has(id);
                return (
                  <FormControlLabel
                    key={a.id}
                    control={<Checkbox checked={elegidos.includes(id)} onChange={() => alternar(id)} disabled={enOtro} />}
                    label={
                      <span>
                        <b>{a.nombre}</b>
                        {a.matricula ? ` · ${a.matricula}` : ''}
                        {enOtro ? ' · ya tiene equipo' : ''}
                      </span>
                    }
                  />
                );
              })}
            </Box>
          )}
          {error && <Alert severity="error" sx={{ borderRadius: '16px' }}>{error}</Alert>}
          <Button type="submit" disabled={!listo || guardando} startIcon={<Iconify icon="biolab:mas" />} sx={{ borderRadius: 99, minHeight: 48, bgcolor: colores.verde, color: colores.crema, '&:hover': { bgcolor: colores.bosque }, '&.Mui-disabled': { bgcolor: colores.salvia, color: colores.crema } }}>
            {guardando ? 'Guardando…' : `Guardar equipo${elegidos.length > 0 ? ` (${elegidos.length})` : ''}`}
          </Button>
        </Box>
      </Tarjeta>

      <Box sx={{ flex: '2 1 420px', display: 'flex', flexDirection: 'column', gap: 2.5, ...sxAparecer(0.16) }}>
        {grupos.map((g) => (
          <Box key={g}>
            <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 22, mb: 1.25 }}>Grupo {g}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1.5 }}>
              {equipos.filter((e) => e.grupo === g).map((equipo) => (
                <Box key={equipo.id} sx={{ bgcolor: colores.crema, borderRadius: '22px', boxShadow: sombraSuave, p: 2, ...sxLevantar }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                    <Typography sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 19 }}>{equipo.nombre}</Typography>
                    <IconButton aria-label={`Borrar ${equipo.nombre}`} onClick={() => onBorrar(equipo.id)} size="small" sx={{ color: colores.tintoClaro }}>
                      <Iconify icon="biolab:basura" width={17} />
                    </IconButton>
                  </Box>
                  {equipo.integrantes.map((i) => (
                    <Box key={i.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4, fontWeight: 600 }}>
                      <Iconify icon="biolab:persona" width={16} sx={{ color: colores.verde }} />
                      {i.nombre}
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
