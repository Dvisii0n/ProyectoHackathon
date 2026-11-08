import type { Rol } from 'src/tipos/dominio';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';

import { useRouter } from 'src/routes/hooks';

import { USAR_MOCKS } from 'src/servicios/cliente-api';
import { rutaInicio } from 'src/layouts/nav-config-dashboard';
import { useSesion, nombresRol, permisosPorRol } from 'src/contexto/sesion';

import { Iconify } from 'src/components/iconify';

import { colores } from './estilos';

// ----------------------------------------------------------------------
// Chip del usuario en el encabezado. En el prototipo permite cambiar de rol
// para enseñar cada vista; con login real se quita el menú.
// ----------------------------------------------------------------------

const roles: Rol[] = ['coordinador', 'laboratorista', 'profesor', 'alumno'];

export function SelectorRol() {
  const router = useRouter();
  const { rol, usuario, cambiarRol, cerrarSesion } = useSesion();
  const [ancla, setAncla] = useState<HTMLElement | null>(null);

  const elegir = (nuevo: Rol) => {
    setAncla(null);
    cambiarRol(nuevo);
    router.push(rutaInicio(permisosPorRol[nuevo]));
  };

  const salir = () => {
    setAncla(null);
    cerrarSesion();
    router.replace('/iniciar-sesion');
  };

  return (
    <>
      <ButtonBase
        onClick={(evento) => setAncla(evento.currentTarget)}
        aria-haspopup="menu"
        aria-label={`${usuario.nombre}, ${nombresRol[rol]}. Abrir menú de cuenta`}
        sx={{
          gap: 1,
          minHeight: 44,
          py: 0.75,
          pl: 0.75,
          pr: 1.5,
          borderRadius: 99,
          bgcolor: colores.crema,
          boxShadow: '0 8px 20px -12px rgba(18,42,14,.45)',
          fontWeight: 800,
          fontSize: 14,
          color: colores.bosque,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: colores.salvia,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="biolab:persona" width={18} />
        </Box>
        {nombresRol[rol]}
        <Iconify icon="eva:arrow-ios-downward-fill" width={16} />
      </ButtonBase>

      <Menu
        anchorEl={ancla}
        open={!!ancla}
        onClose={() => setAncla(null)}
        slotProps={{ paper: { sx: { borderRadius: '18px', mt: 1, minWidth: 200 } } }}
      >
        {/* Cambio de rol solo mientras se usan datos de ejemplo */}
        {USAR_MOCKS &&
          roles.map((opcion) => (
            <MenuItem key={opcion} selected={opcion === rol} onClick={() => elegir(opcion)} sx={{ fontWeight: 700, borderRadius: '12px' }}>
              Ver como {nombresRol[opcion].toLowerCase()}
            </MenuItem>
          ))}
        {USAR_MOCKS && <Divider sx={{ my: 0.5 }} />}
        <MenuItem onClick={salir} sx={{ fontWeight: 800, borderRadius: '12px', gap: 1, color: colores.tinto }}>
          <Iconify icon="biolab:cerrar-sesion" width={18} />
          Cerrar sesión
        </MenuItem>
      </Menu>
    </>
  );
}
