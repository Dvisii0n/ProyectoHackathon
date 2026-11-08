import type { ErroresCuenta } from 'src/utilidades/validar-cuenta';
import type { IconifyName } from 'src/components/iconify/register-icons';
import type { Cuenta, TipoCuenta, NuevaCuenta } from 'src/tipos/dominio';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useDatos } from 'src/ganchos/usar-datos';
import { DashboardContent } from 'src/layouts/dashboard';
import { validarCuenta } from 'src/utilidades/validar-cuenta';
import { AYUDA_GRUPO, normalizarGrupo } from 'src/utilidades/grupo';
import { Tarjeta, ChipEstado, EncabezadoPagina } from 'src/componentes/comunes';
import { colores, brincar, sxAparecer, fuenteTitulos } from 'src/componentes/estilos';
import { crearGrupo, obtenerCuentas, registrarCuenta, obtenerGruposEscolares } from 'src/servicios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Cuentas. Coordinador y laboratorista dan de alta a las personas del
// sistema (no hay registro público). Los campos son los de POST /auth/registro
// del back: usuario, contrasena, tipo, nombre, apellido y, si es alumno,
// matricula y grupo_id.
// ----------------------------------------------------------------------

type InfoTipo = {
  nombre: string;
  descripcion: string;
  icono: IconifyName;
  fondo: string;
  color: string;
};

/** ADMIN en el back es el coordinador en el front */
const infoTipos: Record<TipoCuenta, InfoTipo> = {
  ALUMNO: { nombre: 'Alumno', descripcion: 'Pide material y sube fotos', icono: 'biolab:persona', fondo: colores.menta, color: colores.bosque },
  PROFESOR: { nombre: 'Profesor', descripcion: 'Crea prácticas y equipos', icono: 'biolab:bata', fondo: colores.durazno, color: colores.cafeTexto },
  LABORATORISTA: { nombre: 'Laboratorista', descripcion: 'Atiende solicitudes y reportes', icono: 'biolab:matraz', fondo: colores.salvia, color: colores.bosque },
  ADMIN: { nombre: 'Coordinador', descripcion: 'Recibe reportes y decide', icono: 'biolab:escudo', fondo: colores.rosa, color: colores.tinto },
};

const estiloCampo = { bgcolor: colores.crema, borderRadius: 2 } as const;

type Filtro = TipoCuenta | 'todos';

export function VistaUsuarios() {
  const { datos: cuentas, cargando, error: errorLista, recargar } = useDatos(obtenerCuentas);
  const { datos: grupos, recargar: recargarGrupos } = useDatos(obtenerGruposEscolares);

  const tiposDisponibles = Object.keys(infoTipos) as TipoCuenta[];

  const [tipo, setTipo] = useState<TipoCuenta>('ALUMNO');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [matricula, setMatricula] = useState('');
  const [grupoId, setGrupoId] = useState('');
  const [nuevoGrupo, setNuevoGrupo] = useState('');
  const [creandoGrupo, setCreandoGrupo] = useState(false);
  const [errorGrupo, setErrorGrupo] = useState<string | null>(null);

  const [errores, setErrores] = useState<ErroresCuenta>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [creada, setCreada] = useState<Cuenta | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErrorGeneral(null);
    setCreada(null);

    const nueva: NuevaCuenta = {
      usuario,
      contrasena,
      tipo,
      nombre,
      apellido,
      ...(tipo === 'ALUMNO' && { matricula, grupoId: grupoId === '' ? null : Number(grupoId) }),
    };

    const encontrados = validarCuenta(nueva);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setGuardando(true);
    try {
      const cuenta = await registrarCuenta(nueva);
      setCreada(cuenta);
      setUsuario('');
      setContrasena('');
      setNombre('');
      setApellido('');
      setMatricula('');
      recargar();
    } catch (e) {
      setErrorGeneral(e instanceof Error ? e.message : 'No se pudo crear la cuenta');
    } finally {
      setGuardando(false);
    }
  };

  const agregarGrupo = async () => {
    const nombreGrupo = normalizarGrupo(nuevoGrupo);
    if (!nombreGrupo) {
      setErrorGrupo(AYUDA_GRUPO);
      return;
    }

    setCreandoGrupo(true);
    setErrorGrupo(null);
    try {
      const grupo = await crearGrupo(nombreGrupo);
      setNuevoGrupo('');
      setGrupoId(String(grupo.id));
      recargarGrupos();
    } catch (e) {
      setErrorGrupo(e instanceof Error ? e.message : 'No se pudo crear el grupo');
    } finally {
      setCreandoGrupo(false);
    }
  };

  const visibles = (cuentas ?? []).filter((c) => filtro === 'todos' || c.tipo === filtro);
  const contar = (t: TipoCuenta) => (cuentas ?? []).filter((c) => c.tipo === t).length;

  return (
    <DashboardContent maxWidth="xl">
      <EncabezadoPagina
        antetitulo="Personas del laboratorio"
        titulo="Cuentas"
        descripcion="Da de alta a alumnos, profesores, laboratoristas y coordinación. No hay registro público."
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, alignItems: 'flex-start' }}>
        {/* ----------------------------- Formulario ----------------------------- */}
        <Tarjeta retraso={0.08} sx={{ flex: '1 1 380px', minWidth: 0, bgcolor: colores.menta }}>
          <Box component="form" onSubmit={enviar} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>
              Nueva cuenta
            </Typography>

            <Box>
              <Typography sx={{ fontWeight: 800, mb: 1 }}>¿Quién es?</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1 }}>
                {tiposDisponibles.map((id) => {
                  const info = infoTipos[id];
                  const activo = tipo === id;
                  return (
                    <ButtonBase
                      key={id}
                      onClick={() => {
                        setTipo(id);
                        setErrores({});
                      }}
                      aria-pressed={activo}
                      sx={{
                        p: 1.5,
                        gap: 1.25,
                        borderRadius: '18px',
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        bgcolor: activo ? colores.bosque : colores.crema,
                        color: activo ? colores.crema : colores.bosque,
                        transition: 'background .2s ease, transform .12s ease',
                        '&:active': { transform: 'scale(.97)' },
                      }}
                    >
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: info.fondo, color: info.color }}>
                        <Iconify icon={info.icono} width={22} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 900, lineHeight: 1.15 }}>{info.nombre}</Typography>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 600, opacity: 0.8, lineHeight: 1.25 }}>{info.descripcion}</Typography>
                      </Box>
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 1.5 }}>
              <TextField label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} error={!!errores.nombre} helperText={errores.nombre} autoComplete="off" required sx={estiloCampo} />
              <TextField label="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} error={!!errores.apellido} helperText={errores.apellido} autoComplete="off" required sx={estiloCampo} />
            </Box>

            {tipo === 'ALUMNO' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 1.5, animation: `${brincar} .4s both` }}>
                <TextField label="Matrícula" value={matricula} onChange={(e) => setMatricula(e.target.value)} error={!!errores.matricula} helperText={errores.matricula ?? '8 caracteres'} autoComplete="off" required sx={estiloCampo} />
                <TextField select label="Grupo" value={grupoId} onChange={(e) => setGrupoId(e.target.value)} error={!!errores.grupoId} helperText={errores.grupoId} required sx={estiloCampo}>
                  {(grupos ?? []).map((g) => (
                    <MenuItem key={g.id} value={String(g.id)}>
                      {g.nombre}
                    </MenuItem>
                  ))}
                </TextField>
                <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    size="small"
                    label="¿Falta un grupo? Créalo"
                    placeholder="1-01"
                    value={nuevoGrupo}
                    onChange={(e) => {
                      setNuevoGrupo(e.target.value);
                      setErrorGrupo(null);
                    }}
                    error={!!errorGrupo || (nuevoGrupo.trim() !== '' && !normalizarGrupo(nuevoGrupo))}
                    helperText={errorGrupo ?? AYUDA_GRUPO}
                    sx={{ ...estiloCampo, flex: 1 }}
                  />
                  <Button
                    type="button"
                    onClick={agregarGrupo}
                    disabled={creandoGrupo || !normalizarGrupo(nuevoGrupo)}
                    sx={{ borderRadius: 99, minHeight: 40, px: 2.5, bgcolor: colores.verde, color: colores.crema, '&:hover': { bgcolor: colores.bosque } }}
                  >
                    {creandoGrupo ? '…' : 'Agregar'}
                  </Button>
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 1.5 }}>
              <TextField
                label="Usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                error={!!errores.usuario}
                helperText={errores.usuario ?? 'Con este usuario inicia sesión, p. ej. ana.lopez'}
                autoComplete="off"
                required
                sx={estiloCampo}
              />
              <TextField
                label="Contraseña"
                type={verContrasena ? 'text' : 'password'}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                error={!!errores.contrasena}
                helperText={errores.contrasena ?? 'Mínimo 4 caracteres'}
                autoComplete="new-password"
                required
                sx={estiloCampo}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" onClick={() => setVerContrasena((v) => !v)} aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                          <Iconify icon={verContrasena ? 'biolab:candado' : 'biolab:ojo'} width={20} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            {errorGeneral && (
              <Alert severity="error" sx={{ borderRadius: '16px' }}>
                {errorGeneral}
              </Alert>
            )}

            {creada && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, borderRadius: '18px', bgcolor: colores.crema, fontWeight: 800, animation: `${brincar} .45s both` }}>
                <Box sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: colores.verde, color: colores.crema, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Iconify icon="biolab:paloma" width={20} />
                </Box>
                <span>
                  Cuenta creada: {creada.nombre} ({creada.usuario}). Entrégale su usuario y contraseña.
                </span>
              </Box>
            )}

            <Button
              type="submit"
              size="large"
              disabled={guardando}
              startIcon={<Iconify icon="biolab:mas" />}
              sx={{ borderRadius: 99, minHeight: 52, bgcolor: colores.bosque, color: colores.crema, '&:hover': { bgcolor: colores.verde } }}
            >
              {guardando ? 'Creando…' : `Crear cuenta de ${infoTipos[tipo].nombre.toLowerCase()}`}
            </Button>
          </Box>
        </Tarjeta>

        {/* ----------------------------- Lista ----------------------------- */}
        <Tarjeta retraso={0.14} sx={{ flex: '1.2 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>
            Cuentas registradas
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(['todos', ...(Object.keys(infoTipos) as TipoCuenta[])] as Filtro[]).map((id) => {
              const activo = filtro === id;
              const texto = id === 'todos' ? 'Todas' : infoTipos[id].nombre;
              const total = id === 'todos' ? (cuentas ?? []).length : contar(id);
              return (
                <Button
                  key={id}
                  onClick={() => setFiltro(id)}
                  aria-pressed={activo}
                  sx={{
                    borderRadius: 99,
                    px: 2,
                    minHeight: 42,
                    bgcolor: activo ? colores.bosque : colores.papel,
                    color: activo ? colores.crema : colores.bosque,
                    '&:hover': { bgcolor: activo ? colores.verde : colores.papelOscuro },
                  }}
                >
                  {texto} · {total}
                </Button>
              );
            })}
          </Box>

          {cargando && <Typography sx={{ fontWeight: 700, color: colores.verde }}>Cargando cuentas…</Typography>}
          {errorLista && <Alert severity="error" sx={{ borderRadius: '16px' }}>{errorLista}</Alert>}
          {!cargando && !errorLista && visibles.length === 0 && (
            <Typography sx={{ fontWeight: 700, color: colores.verde }}>Aún no hay cuentas de este tipo.</Typography>
          )}

          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {visibles.map((cuenta, i) => {
              const info = infoTipos[cuenta.tipo];
              return (
                <Box
                  component="li"
                  key={cuenta.id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '18px', bgcolor: colores.papel, ...sxAparecer(Math.min(i, 8) * 0.03) }}
                >
                  <Box sx={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: info.fondo, color: info.color }}>
                    <Iconify icon={info.icono} width={22} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                      {cuenta.nombre} {cuenta.apellido}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colores.verde }}>
                      {cuenta.usuario}
                      {cuenta.matricula ? ` · Matrícula ${cuenta.matricula}` : ''}
                      {cuenta.grupo ? ` · Grupo ${cuenta.grupo}` : ''}
                    </Typography>
                  </Box>
                  <ChipEstado texto={info.nombre} fondo={info.fondo} color={info.color} />
                </Box>
              );
            })}
          </Box>
        </Tarjeta>
      </Box>
    </DashboardContent>
  );
}
