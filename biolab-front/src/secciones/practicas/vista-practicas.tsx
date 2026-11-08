import type { Practica, IdLaboratorio, EquipoAlumnos } from 'src/tipos/dominio';

import { useState } from 'react';
import { useSearchParams } from 'react-router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

import { useDatos } from 'src/ganchos/usar-datos';
import { DashboardContent } from 'src/layouts/dashboard';
import { Tarjeta, ChipEstado, EncabezadoPagina } from 'src/componentes/comunes';
import { colores, brincar, sxAparecer, sxLevantar, sombraSuave, fuenteTitulos } from 'src/componentes/estilos';
import { crearEquipo, borrarEquipo, crearPractica, borrarPractica, obtenerEquipos, obtenerPracticas } from 'src/servicios';

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
              fechaInicial={parametros.get('fecha') ?? ''}
              horaInicial={Number(parametros.get('hora') ?? 10)}
              laboratorioInicial={(parametros.get('laboratorio') as IdLaboratorio | null) ?? 'microbiologia'}
              onCancelar={cerrarFormulario}
              onGuardar={async (nueva) => {
                const creada = await crearPractica(nueva);
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
              sx={{ alignSelf: 'flex-start', borderRadius: 99, minHeight: 54, px: 3, fontSize: 17, bgcolor: colores.verde, color: colores.crema, boxShadow: '0 14px 28px -14px rgba(18,42,14,.7)', '&:hover': { bgcolor: colores.bosque } }}
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
            const creado = await crearEquipo(nuevo);
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
                {horarioPractica(practica.inicio, practica.duracionHoras)}
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {nombresEquipos.map((nombre) => (
                  <ChipEstado key={nombre} texto={nombre} icono="biolab:usuarios" fondo={colores.menta} color="#2E4429" />
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
  fechaInicial: string;
  horaInicial: number;
  laboratorioInicial: IdLaboratorio;
  onGuardar: (nueva: Omit<Practica, 'id' | 'profesorId' | 'profesorNombre'>) => Promise<void>;
  onCancelar: () => void;
  onIrAEquipos: () => void;
};

function FormularioPractica({ equipos, fechaInicial, horaInicial, laboratorioInicial, onGuardar, onCancelar, onIrAEquipos }: FormularioPracticaProps) {
  const grupos = Array.from(new Set(equipos.map((e) => e.grupo))).sort();

  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState(grupos[0] ?? '');
  const [laboratorio, setLaboratorio] = useState<IdLaboratorio>(laboratorioInicial);
  const [fecha, setFecha] = useState(fechaInicial);
  const [hora, setHora] = useState(horaInicial);
  const [duracion, setDuracion] = useState(2);
  const [descripcion, setDescripcion] = useState('');
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);

  const equiposDelGrupo = equipos.filter((e) => e.grupo === grupo);
  const listo = nombre.trim() !== '' && fecha !== '' && elegidos.length > 0;

  const alternar = (id: string) => setElegidos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!listo) return;
    setGuardando(true);
    try {
      await onGuardar({
        nombre: nombre.trim(),
        grupo,
        laboratorioId: laboratorio,
        inicio: `${fecha}T${String(hora).padStart(2, '0')}:00:00`,
        duracionHoras: duracion,
        descripcion: descripcion.trim() || undefined,
        equipoIds: elegidos,
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Tarjeta sx={{ bgcolor: colores.menta, animation: `${brincar} .45s both` }}>
      <Box component="form" onSubmit={guardar} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>
          Nueva práctica
        </Typography>

        <TextField label="Nombre de la práctica" placeholder="Ej. Siembra de cultivos" value={nombre} onChange={(e) => setNombre(e.target.value)} required sx={{ bgcolor: colores.crema, borderRadius: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 1.5 }}>
          <TextField select label="Laboratorio" value={laboratorio} onChange={(e) => setLaboratorio(e.target.value as IdLaboratorio)} sx={{ bgcolor: colores.crema, borderRadius: 2 }}>
            {(Object.keys(aparienciaLaboratorio) as IdLaboratorio[]).map((id) => (
              <MenuItem key={id} value={id}>{aparienciaLaboratorio[id].nombre}</MenuItem>
            ))}
          </TextField>
          <TextField type="date" label="Día" value={fecha} onChange={(e) => setFecha(e.target.value)} required slotProps={{ inputLabel: { shrink: true } }} sx={{ bgcolor: colores.crema, borderRadius: 2 }} />
          <TextField select label="Hora de inicio" value={hora} onChange={(e) => setHora(Number(e.target.value))} sx={{ bgcolor: colores.crema, borderRadius: 2 }}>
            {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((h) => (
              <MenuItem key={h} value={h}>{h}:00</MenuItem>
            ))}
          </TextField>
          <TextField select label="Duración" value={duracion} onChange={(e) => setDuracion(Number(e.target.value))} sx={{ bgcolor: colores.crema, borderRadius: 2 }}>
            {[1, 2, 3, 4].map((h) => (
              <MenuItem key={h} value={h}>{h === 1 ? '1 hora' : `${h} horas`}</MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField label="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} multiline minRows={2} sx={{ bgcolor: colores.crema, borderRadius: 2 }} />

        <Box>
          <Typography sx={{ fontWeight: 800, mb: 1 }}>¿Qué equipos la hacen?</Typography>
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
                  return (
                    <ButtonBase
                      key={equipo.id}
                      onClick={() => alternar(equipo.id)}
                      aria-pressed={elegido}
                      sx={{ justifyContent: 'flex-start', alignItems: 'flex-start', gap: 1.25, p: 1.5, borderRadius: '18px', textAlign: 'left', bgcolor: colores.crema, boxShadow: elegido ? `inset 0 0 0 3px ${colores.verde}` : 'none' }}
                    >
                      <Box sx={{ width: 26, height: 26, borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: elegido ? colores.verde : colores.papelOscuro, color: colores.crema }}>
                        {elegido && <Iconify icon="biolab:paloma" width={16} />}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800 }}>{equipo.nombre}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colores.verde }}>{equipo.integrantes.map((i) => i.nombre).join(', ')}</Typography>
                      </Box>
                    </ButtonBase>
                  );
                })}
              </Box>
            </>
          )}
        </Box>

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
  onCrear: (nuevo: { nombre: string; grupo: string; integrantes: { id: string; nombre: string }[] }) => Promise<void>;
  onBorrar: (id: string) => void;
};

function SeccionEquipos({ equipos, onCrear, onBorrar }: SeccionEquiposProps) {
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('');
  const [integrantes, setIntegrantes] = useState('');

  const lista = integrantes.split('\n').map((n) => n.trim()).filter(Boolean);
  const listo = nombre.trim() !== '' && grupo.trim() !== '' && lista.length > 0;
  const grupos = Array.from(new Set(equipos.map((e) => e.grupo))).sort();

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!listo) return;
    // TODO back: los integrantes deberían elegirse de los alumnos registrados (con su id real)
    await onCrear({ nombre: nombre.trim(), grupo: grupo.trim().toUpperCase(), integrantes: lista.map((n, i) => ({ id: `nuevo-${Date.now()}-${i}`, nombre: n })) });
    setNombre('');
    setIntegrantes('');
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, alignItems: 'flex-start' }}>
      <Tarjeta sx={{ flex: '1 1 300px', bgcolor: colores.menta }} retraso={0.1}>
        <Box component="form" onSubmit={guardar} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 22 }}>Registrar equipo</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: colores.verde }}>Se hace una vez a principio de semestre.</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 1.25 }}>
            <TextField label="Nombre" placeholder="Equipo 4" value={nombre} onChange={(e) => setNombre(e.target.value)} sx={{ bgcolor: colores.crema, borderRadius: 2 }} />
            <TextField label="Grupo" placeholder="3B" value={grupo} onChange={(e) => setGrupo(e.target.value)} sx={{ bgcolor: colores.crema, borderRadius: 2 }} />
          </Box>
          <TextField label="Integrantes (uno por renglón)" value={integrantes} onChange={(e) => setIntegrantes(e.target.value)} multiline minRows={4} sx={{ bgcolor: colores.crema, borderRadius: 2 }} />
          <Button type="submit" disabled={!listo} startIcon={<Iconify icon="biolab:mas" />} sx={{ borderRadius: 99, minHeight: 48, bgcolor: colores.verde, color: colores.crema, '&:hover': { bgcolor: colores.bosque }, '&.Mui-disabled': { bgcolor: colores.salvia, color: colores.crema } }}>
            Guardar equipo
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
