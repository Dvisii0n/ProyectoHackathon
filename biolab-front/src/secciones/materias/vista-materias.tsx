import type { Materia, AsignacionMateria } from 'src/tipos/dominio';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useDatos } from 'src/ganchos/usar-datos';
import { DashboardContent } from 'src/layouts/dashboard';
import { Tarjeta, ChipEstado, EncabezadoPagina } from 'src/componentes/comunes';
import { colores, brincar, sxAparecer, fuenteTitulos } from 'src/componentes/estilos';
import {
  quitarGrupo,
  crearMateria,
  asignarGrupo,
  borrarMateria,
  asignarMateria,
  obtenerMaterias,
  obtenerCarreras,
  quitarAsignacion,
  obtenerProfesores,
  obtenerAsignaciones,
  obtenerGruposEscolares,
} from 'src/servicios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Materias. Coordinador y laboratorista dan de alta las materias de cada
// carrera (tabla MATERIAS), le asignan profesor (R_PROFESOR_MATERIA) y los
// grupos a los que la imparte (R_PROFMAT_GRUPO). Sin esto el profesor no
// puede registrar equipos de alumnos.
// ----------------------------------------------------------------------

const estiloCampo = { bgcolor: colores.crema, borderRadius: 2 } as const;

/** "LICENCIATURA EN CIENCIAS BIOMEDICAS" → "Ciencias biomédicas" */
function nombreCorto(carrera: string) {
  const sinPrefijo = carrera.replace(/^LICENCIATURA EN /i, '').toLowerCase();
  return sinPrefijo.charAt(0).toUpperCase() + sinPrefijo.slice(1);
}

function mensaje(e: unknown, porDefecto: string) {
  return e instanceof Error ? e.message : porDefecto;
}

export function VistaMaterias() {
  const { datos: carreras } = useDatos(obtenerCarreras);
  const { datos: materias, cargando, error: errorLista, recargar: recargarMaterias } = useDatos(obtenerMaterias);
  const { datos: asignaciones, recargar: recargarAsignaciones } = useDatos(obtenerAsignaciones);
  const { datos: profesores } = useDatos(obtenerProfesores);
  const { datos: grupos } = useDatos(obtenerGruposEscolares);

  const [nombre, setNombre] = useState('');
  const [carreraId, setCarreraId] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargarTodo = () => {
    recargarMaterias();
    recargarAsignaciones();
  };

  /** Ejecuta una acción y muestra el error del back si falla */
  const intentar = async (accion: () => Promise<void>, porDefecto: string) => {
    setError(null);
    try {
      await accion();
      recargarTodo();
    } catch (e) {
      setError(mensaje(e, porDefecto));
    }
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (nombre.trim() === '' || carreraId === '') return;
    setGuardando(true);
    await intentar(async () => {
      await crearMateria({ nombre, carreraId: Number(carreraId) });
      setNombre('');
    }, 'No se pudo crear la materia');
    setGuardando(false);
  };

  const porCarrera = (carreras ?? [])
    .map((c) => ({ carrera: c, materias: (materias ?? []).filter((m) => m.carreraId === c.id) }))
    .filter((g) => g.materias.length > 0);

  return (
    <DashboardContent maxWidth="xl">
      <EncabezadoPagina
        antetitulo="Plan del semestre"
        titulo="Materias"
        descripcion="Da de alta las materias, asígnales profesor y elige a qué grupos las imparte."
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: '16px', mb: 2.5 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, alignItems: 'flex-start' }}>
        <Tarjeta retraso={0.08} sx={{ flex: '1 1 320px', minWidth: 0, bgcolor: colores.menta }}>
          <Box component="form" onSubmit={enviar} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>
              Nueva materia
            </Typography>
            <TextField label="Nombre" placeholder="Microbiología" value={nombre} onChange={(e) => setNombre(e.target.value)} slotProps={{ htmlInput: { maxLength: 255 } }} required sx={estiloCampo} />
            <TextField select label="Carrera" value={carreraId} onChange={(e) => setCarreraId(e.target.value)} required sx={estiloCampo}>
              {(carreras ?? []).map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {nombreCorto(c.nombre)}
                </MenuItem>
              ))}
            </TextField>
            {carreras && carreras.length === 0 && (
              <Alert severity="warning" sx={{ borderRadius: '16px' }}>
                No hay carreras en la base. Corre <code>npm run db:init</code> en el back para crearlas.
              </Alert>
            )}
            <Button
              type="submit"
              size="large"
              disabled={guardando || nombre.trim() === '' || carreraId === ''}
              startIcon={<Iconify icon="biolab:mas" />}
              sx={{ borderRadius: 99, minHeight: 52, bgcolor: colores.bosque, color: colores.crema, '&:hover': { bgcolor: colores.verde }, '&.Mui-disabled': { bgcolor: colores.salvia, color: colores.crema } }}
            >
              {guardando ? 'Guardando…' : 'Crear materia'}
            </Button>
          </Box>
        </Tarjeta>

        <Box sx={{ flex: '2 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.5, ...sxAparecer(0.14) }}>
          {cargando && <Typography sx={{ fontWeight: 700, color: colores.verde }}>Cargando materias…</Typography>}
          {errorLista && <Alert severity="error" sx={{ borderRadius: '16px' }}>{errorLista}</Alert>}
          {!cargando && !errorLista && porCarrera.length === 0 && (
            <Tarjeta>
              <Typography sx={{ fontWeight: 700, color: colores.verde }}>Aún no hay materias. Crea la primera con el formulario.</Typography>
            </Tarjeta>
          )}

          {porCarrera.map(({ carrera, materias: lista }) => (
            <Box key={carrera.id}>
              <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 22, mb: 1.25 }}>
                {nombreCorto(carrera.nombre)}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {lista.map((materia) => (
                  <TarjetaMateria
                    key={materia.id}
                    materia={materia}
                    asignaciones={(asignaciones ?? []).filter((a) => a.materiaId === materia.id)}
                    profesores={profesores ?? []}
                    grupos={grupos ?? []}
                    onBorrar={() => intentar(() => borrarMateria(materia.id), 'No se pudo borrar la materia (¿ya tiene profesor asignado?)')}
                    onAsignar={(profesorId) => intentar(() => asignarMateria(materia.id, profesorId), 'No se pudo asignar el profesor')}
                    onQuitarAsignacion={(a) => intentar(() => quitarAsignacion(a), 'No se pudo quitar la asignación')}
                    onAgregarGrupo={(a, grupoId) => intentar(() => asignarGrupo(a.id, grupoId), 'No se pudo agregar el grupo')}
                    onQuitarGrupo={(a, grupoId) => intentar(() => quitarGrupo(a.id, grupoId), 'No se pudo quitar el grupo (¿ya tiene equipos?)')}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </DashboardContent>
  );
}

// ---------------------------- Tarjeta de una materia ----------------------------

type TarjetaMateriaProps = {
  materia: Materia;
  asignaciones: AsignacionMateria[];
  profesores: { id: number; nombre: string }[];
  grupos: { id: number; nombre: string }[];
  onBorrar: () => void;
  onAsignar: (profesorId: number) => void;
  onQuitarAsignacion: (asignacion: AsignacionMateria) => void;
  onAgregarGrupo: (asignacion: AsignacionMateria, grupoId: number) => void;
  onQuitarGrupo: (asignacion: AsignacionMateria, grupoId: number) => void;
};

function TarjetaMateria({ materia, asignaciones, profesores, grupos, onBorrar, onAsignar, onQuitarAsignacion, onAgregarGrupo, onQuitarGrupo }: TarjetaMateriaProps) {
  const libres = profesores.filter((p) => !asignaciones.some((a) => a.profesorId === p.id));

  return (
    <Box sx={{ bgcolor: colores.crema, borderRadius: '22px', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, animation: `${brincar} .4s both` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: colores.menta, color: colores.bosque }}>
          <Iconify icon="biolab:microscopio" width={22} />
        </Box>
        <Typography sx={{ flex: 1, minWidth: 0, fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 19 }}>{materia.nombre}</Typography>
        {asignaciones.length === 0 && <ChipEstado texto="Sin profesor" fondo={colores.durazno} color={colores.cafeTexto} />}
        <IconButton aria-label={`Borrar ${materia.nombre}`} onClick={onBorrar} size="small" sx={{ color: colores.tintoClaro }}>
          <Iconify icon="biolab:basura" width={18} />
        </IconButton>
      </Box>

      {asignaciones.map((asignacion) => {
        const gruposLibres = grupos.filter((g) => !asignacion.grupos.some((x) => x.id === g.id));
        return (
          <Box key={asignacion.id} sx={{ bgcolor: colores.papel, borderRadius: '18px', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="biolab:bata" width={18} sx={{ color: colores.verde }} />
              <Typography sx={{ flex: 1, fontWeight: 800 }}>{asignacion.profesorNombre}</Typography>
              <Button size="small" onClick={() => onQuitarAsignacion(asignacion)} sx={{ borderRadius: 99, color: colores.tintoClaro }}>
                Quitar
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              {asignacion.grupos.length === 0 && (
                <Typography variant="body2" sx={{ fontWeight: 600, color: colores.verde }}>
                  Sin grupos todavía.
                </Typography>
              )}
              {asignacion.grupos.map((g) => (
                <Box key={g.id} component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, pl: 1.5, pr: 0.5, py: 0.25, borderRadius: 99, bgcolor: colores.salviaClara, fontWeight: 800 }}>
                  {g.nombre}
                  <IconButton aria-label={`Quitar grupo ${g.nombre}`} size="small" onClick={() => onQuitarGrupo(asignacion, g.id)} sx={{ p: 0.25 }}>
                    <Iconify icon="biolab:cruz" width={14} />
                  </IconButton>
                </Box>
              ))}
              {gruposLibres.length > 0 && (
                <TextField
                  select
                  size="small"
                  label="Agregar grupo"
                  value=""
                  onChange={(e) => onAgregarGrupo(asignacion, Number(e.target.value))}
                  sx={{ ...estiloCampo, minWidth: 150 }}
                >
                  {gruposLibres.map((g) => (
                    <MenuItem key={g.id} value={String(g.id)}>
                      {g.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Box>
          </Box>
        );
      })}

      {libres.length > 0 ? (
        <TextField select size="small" label="Asignar profesor" value="" onChange={(e) => onAsignar(Number(e.target.value))} sx={{ ...estiloCampo, maxWidth: 320 }}>
          {libres.map((p) => (
            <MenuItem key={p.id} value={String(p.id)}>
              {p.nombre}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        profesores.length === 0 && (
          <Typography variant="body2" sx={{ fontWeight: 600, color: colores.verde }}>
            No hay profesores registrados. Créalos en Cuentas.
          </Typography>
        )
      )}
    </Box>
  );
}
