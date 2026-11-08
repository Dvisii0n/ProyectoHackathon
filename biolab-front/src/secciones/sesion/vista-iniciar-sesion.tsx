import type { Rol } from 'src/tipos/dominio';

import { useState } from 'react';
import { Navigate } from 'react-router';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { entrar } from 'src/servicios';
import { Capi } from 'src/componentes/capi';
import { usuariosMock } from 'src/datos-mock';
import { USAR_MOCKS } from 'src/servicios/cliente-api';
import { rutaInicio } from 'src/layouts/nav-config-dashboard';
import { colores, fuenteTitulos } from 'src/componentes/estilos';
import { useSesion, nombresRol, permisosPorRol } from 'src/contexto/sesion';

// ----------------------------------------------------------------------
// Inicio de sesión. No hay registro: las cuentas las da de alta la coordinación.
// ----------------------------------------------------------------------

export function VistaIniciarSesion() {
  const router = useRouter();
  const { sesionIniciada, permisos, iniciarSesion } = useSesion();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  if (sesionIniciada) {
    return <Navigate to={rutaInicio(permisos)} replace />;
  }

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError(null);
    setEntrando(true);
    try {
      const sesion = await entrar(usuario, contrasena);
      iniciarSesion(sesion);
      router.replace(rutaInicio(permisosPorRol[sesion.rol]));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión');
    } finally {
      setEntrando(false);
    }
  };

  /** Solo con datos de ejemplo: llena el usuario de prueba */
  const llenarDemo = (rol: Rol) => {
    const demo = usuariosMock.find((u) => u.rol === rol);
    if (demo) {
      setUsuario(demo.usuario);
      setContrasena('demo');
    }
  };

  return (
    <Box component="form" onSubmit={enviar} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, textAlign: 'center' }}>
        <Capi ancho={150} flotando etiqueta="Capi te saluda" />
        <Typography component="h1" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 32 }}>
          Bienvenido a Biolab
        </Typography>
        <Typography sx={{ fontWeight: 600, color: colores.verde }}>Laboratorio de la Licenciatura en Ciencias Biomédicas</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: '16px' }}>
          {error}
        </Alert>
      )}

      <TextField label="Usuario" autoComplete="username" required value={usuario} onChange={(e) => setUsuario(e.target.value)} fullWidth />
      <TextField label="Contraseña" type="password" autoComplete="current-password" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} fullWidth />

      <Button
        type="submit"
        size="large"
        fullWidth
        disabled={entrando}
        sx={{ borderRadius: 99, minHeight: 52, bgcolor: colores.verde, color: colores.crema, '&:hover': { bgcolor: colores.bosque } }}
      >
        {entrando ? 'Entrando…' : 'Entrar'}
      </Button>

      <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 600, color: colores.verde }}>
        ¿No tienes cuenta? Pídele acceso a la coordinación del laboratorio.
      </Typography>

      {USAR_MOCKS && (
        <Box sx={{ p: 2, borderRadius: '18px', bgcolor: colores.papel }}>
          <Typography variant="body2" sx={{ fontWeight: 800, mb: 1 }}>
            Cuentas de prueba (solo prototipo)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(['coordinador', 'laboratorista', 'profesor', 'alumno'] as Rol[]).map((rol) => (
              <Button key={rol} size="small" onClick={() => llenarDemo(rol)} sx={{ borderRadius: 99, px: 1.75, bgcolor: colores.crema, color: colores.bosque }}>
                {nombresRol[rol]}
              </Button>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
