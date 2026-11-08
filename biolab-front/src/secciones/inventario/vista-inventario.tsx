import type { NuevoArticulo, ArticuloInventario, CategoriaInventario } from 'src/tipos/dominio';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useSesion } from 'src/contexto/sesion';
import { useDatos } from 'src/ganchos/usar-datos';
import { DashboardContent } from 'src/layouts/dashboard';
import { EncabezadoPagina } from 'src/componentes/comunes';
import { colores, brincar, fuenteTitulos } from 'src/componentes/estilos';
import { crearArticulo, borrarArticulo, obtenerInventario } from 'src/servicios';

import { Iconify } from 'src/components/iconify';

import { ExploradorInventario, categoriasInventario } from '../compartido/explorador-inventario';

import type { VistaArticulos } from '../compartido/explorador-inventario';

// ----------------------------------------------------------------------
// Inventario por pestañas tipo carpeta (laboratorista, coordinador y profesor).
// El laboratorista agrega, edita y borra; los demás solo ven.
// El alumno no entra aquí: ve el inventario desde "Pedir material".
// ----------------------------------------------------------------------

export function VistaInventario() {
  const { permisos } = useSesion();
  const [categoria, setCategoria] = useState<CategoriaInventario>('consumibles');
  const [vista, setVista] = useState<VistaArticulos>('tarjetas');
  const [agregando, setAgregando] = useState(false);

  const { datos: articulos, setDatos: setArticulos } = useDatos(() => obtenerInventario(categoria), [categoria]);

  const pestana = categoriasInventario.find((p) => p.id === categoria) ?? categoriasInventario[0];
  const puedeEditar = permisos.editarInventario;

  const guardar = async (nuevo: NuevoArticulo) => {
    const creado = await crearArticulo(nuevo);
    setArticulos((anteriores) => [creado, ...(anteriores ?? [])]);
    setAgregando(false);
  };

  const borrar = async (articulo: ArticuloInventario) => {
    setArticulos((anteriores) => anteriores?.filter((a) => a.id !== articulo.id) ?? null);
    await borrarArticulo(articulo.id);
  };

  return (
    <DashboardContent maxWidth="lg">
      <EncabezadoPagina
        antetitulo="Lo que hay en el laboratorio"
        titulo="Inventario"
        descripcion="El tubito muestra cuánto queda. Si se pone tinto, hay que pedir más."
      />

      <ExploradorInventario
        categoria={categoria}
        onCambiarCategoria={(nueva) => {
          setCategoria(nueva);
          setAgregando(false);
        }}
        articulos={articulos}
        vista={vista}
        onCambiarVista={setVista}
        acciones={
          puedeEditar
            ? (articulo) => (
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <IconButton aria-label={`Editar ${articulo.nombre}`} sx={{ width: 44, height: 44, bgcolor: colores.crema, color: colores.verde }}>
                    <Iconify icon="biolab:lapiz" width={19} />
                  </IconButton>
                  <IconButton aria-label={`Borrar ${articulo.nombre}`} onClick={() => borrar(articulo)} sx={{ width: 44, height: 44, bgcolor: colores.rosa, color: colores.tinto }}>
                    <Iconify icon="biolab:basura" width={19} />
                  </IconButton>
                </Box>
              )
            : undefined
        }
        arriba={
          <>
            {!puedeEditar && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1.5, borderRadius: '18px', bgcolor: colores.papel, fontWeight: 700 }}>
                <Iconify icon="biolab:ojo" width={20} sx={{ color: colores.verde }} />
                Estás en modo vista. Agregar, editar o borrar lo hace el laboratorista.
              </Box>
            )}
            {agregando && <FormularioArticulo categoria={categoria} nombreCategoria={pestana.nombre} onGuardar={guardar} onCancelar={() => setAgregando(false)} />}
          </>
        }
        abajo={
          puedeEditar && !agregando ? (
            <Button
              onClick={() => setAgregando(true)}
              size="large"
              startIcon={
                <Box component="span" sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: colores.crema, color: colores.verde, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon="biolab:mas" width={20} />
                </Box>
              }
              sx={{ alignSelf: 'flex-start', mt: 0.5, minHeight: 54, pl: 1.5, pr: 3.25, borderRadius: 99, fontSize: 17, bgcolor: colores.verde, color: colores.crema, boxShadow: '0 14px 28px -14px rgba(18,42,14,.7)', '&:hover': { bgcolor: colores.bosque } }}
            >
              Agregar a {pestana.nombre.toLowerCase()}
            </Button>
          ) : undefined
        }
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

type FormularioArticuloProps = {
  categoria: CategoriaInventario;
  nombreCategoria: string;
  onGuardar: (nuevo: NuevoArticulo) => void;
  onCancelar: () => void;
};

function FormularioArticulo({ categoria, nombreCategoria, onGuardar, onCancelar }: FormularioArticuloProps) {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const listo = nombre.trim() !== '' && cantidad.trim() !== '';

  return (
    <Box
      component="form"
      onSubmit={(evento: React.FormEvent) => {
        evento.preventDefault();
        if (listo) onGuardar({ nombre: nombre.trim(), cantidad: cantidad.trim(), descripcion: descripcion.trim() || undefined, categoria });
      }}
      sx={{ p: 2.5, borderRadius: '24px', bgcolor: colores.menta, display: 'flex', flexDirection: 'column', gap: 1.75, animation: `${brincar} .45s both` }}
    >
      <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 22 }}>
        Agregar a {nombreCategoria.toLowerCase()}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1.5 }}>
        <TextField label="Nombre" placeholder="Ej. Cubrebocas" value={nombre} onChange={(e) => setNombre(e.target.value)} sx={{ bgcolor: colores.crema, borderRadius: 2 }} />
        <TextField label="Cantidad" placeholder="Ej. 120 pzas" value={cantidad} onChange={(e) => setCantidad(e.target.value)} sx={{ bgcolor: colores.crema, borderRadius: 2 }} />
      </Box>
      <TextField
        label="Descripción"
        placeholder="Para qué se usa, dónde se guarda…"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        multiline
        minRows={2}
        sx={{ bgcolor: colores.crema, borderRadius: 2 }}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
        <Button type="submit" disabled={!listo} sx={{ borderRadius: 99, px: 3, minHeight: 48, bgcolor: colores.verde, color: colores.crema, '&:hover': { bgcolor: colores.bosque }, '&.Mui-disabled': { bgcolor: colores.salvia, color: colores.crema } }}>
          Guardar
        </Button>
        <Button onClick={onCancelar} sx={{ borderRadius: 99, px: 3, minHeight: 48, bgcolor: colores.crema, color: colores.bosque }}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}
