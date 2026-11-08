import type { EnvaseReactivo } from 'src/utilidades/unidades';
import type { TipoMaterial, NuevoArticulo, TipoConsumible, ArticuloInventario, CategoriaInventario } from 'src/tipos/dominio';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useSesion } from 'src/contexto/sesion';
import { useDatos } from 'src/ganchos/usar-datos';
import { DashboardContent } from 'src/layouts/dashboard';
import { EncabezadoPagina } from 'src/componentes/comunes';
import { colores, brincar, fuenteTitulos } from 'src/componentes/estilos';
import { crearArticulo, borrarArticulo, editarArticulo, obtenerInventario } from 'src/servicios';
import { unidadValida, UNIDADES_CONTEO, ENVASES_REACTIVO, presentacionValida, unirUnidadReactivo, UNIDADES_PRESENTACION, separarUnidadReactivo } from 'src/utilidades/unidades';

import { Iconify } from 'src/components/iconify';

import { tiposMaterial, ExploradorInventario, categoriasInventario } from '../compartido/explorador-inventario';

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
  const [tipo, setTipo] = useState<TipoMaterial | 'todos'>('todos');

  const { datos: articulos, setDatos: setArticulos } = useDatos(() => obtenerInventario(categoria), [categoria]);

  const pestana = categoriasInventario.find((p) => p.id === categoria) ?? categoriasInventario[0];
  const puedeEditar = permisos.editarInventario;

  const guardar = async (nuevo: NuevoArticulo) => {
    const creado = await crearArticulo(nuevo);
    setArticulos((anteriores) => [creado, ...(anteriores ?? [])]);
    setAgregando(false);
  };

  const [editando, setEditando] = useState<ArticuloInventario | null>(null);
  const [porBorrar, setPorBorrar] = useState<ArticuloInventario | null>(null);

  const guardarEdicion = async (id: string, datos: NuevoArticulo) => {
    const actualizado = await editarArticulo(id, datos);
    setArticulos((anteriores) => anteriores?.map((a) => (a.id === id ? actualizado : a)) ?? null);
    setEditando(null);
  };

  const borrar = async (articulo: ArticuloInventario) => {
    await borrarArticulo(articulo.id);
    setArticulos((anteriores) => anteriores?.filter((a) => a.id !== articulo.id) ?? null);
    setPorBorrar(null);
  };

  return (
    <DashboardContent maxWidth="lg">
      <EncabezadoPagina
        antetitulo="Lo que hay en el laboratorio"
        titulo="Inventario"
        descripcion="Materiales, consumibles y reactivos, y equipo del laboratorio de Ciencias Biomédicas."
      />

      <ExploradorInventario
        categoria={categoria}
        onCambiarCategoria={(nueva) => {
          setCategoria(nueva);
          setAgregando(false);
        }}
        articulos={categoria === 'utensilios' && tipo !== 'todos' ? (articulos?.filter((a) => a.tipoMaterial === tipo) ?? null) : articulos}
        vista={vista}
        onCambiarVista={setVista}
        acciones={
          puedeEditar
            ? (articulo) => (
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <IconButton aria-label={`Editar ${articulo.nombre}`} onClick={() => setEditando(articulo)} sx={{ width: 44, height: 44, bgcolor: colores.crema, color: colores.verde }}>
                    <Iconify icon="biolab:lapiz" width={19} />
                  </IconButton>
                  <IconButton aria-label={`Borrar ${articulo.nombre}`} onClick={() => setPorBorrar(articulo)} sx={{ width: 44, height: 44, bgcolor: colores.rosa, color: colores.tinto }}>
                    <Iconify icon="biolab:basura" width={19} />
                  </IconButton>
                </Box>
              )
            : undefined
        }
        arriba={
          <>
            {categoria === 'utensilios' && (
              <Box role="group" aria-label="Tipo de material" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[{ id: 'todos' as const, nombre: 'Todos' }, ...tiposMaterial].map((t) => {
                  const activo = tipo === t.id;
                  const total = (articulos ?? []).filter((a) => t.id === 'todos' || a.tipoMaterial === t.id).length;
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
            {!puedeEditar && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1.5, borderRadius: '18px', bgcolor: colores.papel, fontWeight: 700 }}>
                <Iconify icon="biolab:ojo" width={20} sx={{ color: colores.verde }} />
                Estás en modo vista. Agregar, editar o borrar lo hace el laboratorista.
              </Box>
            )}
            {agregando && (
              <Box sx={{ p: 2.5, borderRadius: '24px', bgcolor: colores.menta, animation: `${brincar} .45s both` }}>
                <FormularioArticulo categoria={categoria} titulo={`Agregar a ${pestana.nombre.toLowerCase()}`} conDescripcion onGuardar={guardar} onCancelar={() => setAgregando(false)} />
              </Box>
            )}
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
              sx={{ alignSelf: 'flex-start', mt: 0.5, minHeight: 54, pl: 1.5, pr: 3.25, borderRadius: 99, fontSize: 17, bgcolor: colores.verde, color: colores.crema, boxShadow: '0 14px 28px -14px rgba(90,31,55,.7)', '&:hover': { bgcolor: colores.bosque } }}
            >
              Agregar a {pestana.nombre.toLowerCase()}
            </Button>
          ) : undefined
        }
      />

      {editando && <DialogoEditar articulo={editando} onGuardar={(datos) => guardarEdicion(editando.id, datos)} onCerrar={() => setEditando(null)} />}
      {porBorrar && <DialogoBorrar articulo={porBorrar} onConfirmar={() => borrar(porBorrar)} onCerrar={() => setPorBorrar(null)} />}
    </DashboardContent>
  );
}

// ---------------------------- Diálogos ----------------------------

const sxDialogo = { borderRadius: '28px', bgcolor: colores.crema, p: { xs: 2, sm: 3 }, width: 'min(560px, calc(100% - 32px))', m: 2 } as const;
const sxBotonPrincipal = { borderRadius: 99, px: 3, minHeight: 48, bgcolor: colores.verde, color: colores.crema, '&:hover': { bgcolor: colores.bosque }, '&.Mui-disabled': { bgcolor: colores.salvia, color: colores.crema } } as const;
const sxBotonPeligro = { borderRadius: 99, px: 3, minHeight: 48, bgcolor: colores.tinto, color: colores.crema, '&:hover': { bgcolor: colores.bosque }, '&.Mui-disabled': { bgcolor: colores.salvia, color: colores.crema } } as const;
const sxBotonSecundario = { borderRadius: 99, px: 3, minHeight: 48, bgcolor: colores.papel, color: colores.bosque, '&:hover': { bgcolor: colores.papelOscuro } } as const;

function mensajeDe(e: unknown, porDefecto: string) {
  return e instanceof Error && e.message ? e.message : porDefecto;
}

/** Editar en dos pasos: formulario y luego confirmar los cambios */
function DialogoEditar({ articulo, onGuardar, onCerrar }: { articulo: ArticuloInventario; onGuardar: (datos: NuevoArticulo) => Promise<void>; onCerrar: () => void }) {
  const [pendiente, setPendiente] = useState<NuevoArticulo | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tipoAntes = tiposMaterial.find((t) => t.id === articulo.tipoMaterial)?.singular;
  const tipoDespues = tiposMaterial.find((t) => t.id === pendiente?.tipoMaterial)?.singular;
  const cambios = pendiente
    ? [
        ['Nombre', articulo.nombre, pendiente.nombre],
        ['Cantidad', articulo.cantidad, pendiente.cantidad],
        ['Mínimo de stock', String(articulo.minimo ?? 0), String(pendiente.minimo ?? 0)],
        ...(articulo.categoria === 'utensilios' ? [['Tipo', tipoAntes ?? '', tipoDespues ?? '']] : []),
      ].filter(([, antes, despues]) => antes !== despues)
    : [];

  const confirmar = async () => {
    if (!pendiente) return;
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(pendiente);
    } catch (e) {
      setError(mensajeDe(e, 'No se pudieron guardar los cambios'));
      setGuardando(false);
    }
  };

  return (
    <Dialog open onClose={guardando ? undefined : onCerrar} slotProps={{ paper: { sx: sxDialogo } }}>
      {!pendiente ? (
        <FormularioArticulo
          categoria={articulo.categoria}
          titulo={`Editar ${articulo.nombre}`}
          inicial={articulo}
          textoGuardar="Revisar cambios"
          onGuardar={(datos) => setPendiente(datos)}
          onCancelar={onCerrar}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>
            ¿Guardar los cambios?
          </Typography>
          {cambios.length === 0 ? (
            <Typography sx={{ fontWeight: 600 }}>No cambiaste nada.</Typography>
          ) : (
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {cambios.map(([campo, antes, despues]) => (
                <Box component="li" key={campo} sx={{ p: 1.5, borderRadius: '16px', bgcolor: colores.papel }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 900, color: colores.tintoClaro }}>{campo.toUpperCase()}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    <Box component="span" sx={{ textDecoration: 'line-through', color: colores.tintoClaro }}>{antes || '—'}</Box>
                    {'  →  '}
                    {despues}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          {error && <Alert severity="error" sx={{ borderRadius: '16px' }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <Button onClick={confirmar} disabled={guardando || cambios.length === 0} sx={sxBotonPrincipal}>
              {guardando ? 'Guardando…' : 'Sí, guardar'}
            </Button>
            <Button onClick={() => setPendiente(null)} disabled={guardando} sx={sxBotonSecundario}>
              Volver a editar
            </Button>
          </Box>
        </Box>
      )}
    </Dialog>
  );
}

function DialogoBorrar({ articulo, onConfirmar, onCerrar }: { articulo: ArticuloInventario; onConfirmar: () => Promise<void>; onCerrar: () => void }) {
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmar = async () => {
    setBorrando(true);
    setError(null);
    try {
      await onConfirmar();
    } catch (e) {
      setError(mensajeDe(e, 'No se pudo borrar el artículo'));
      setBorrando(false);
    }
  };

  return (
    <Dialog open onClose={borrando ? undefined : onCerrar} slotProps={{ paper: { sx: sxDialogo } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: colores.rosa, color: colores.tinto, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Iconify icon="biolab:basura" width={26} />
        </Box>
        <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>
          ¿Borrar {articulo.nombre}?
        </Typography>
        <Typography sx={{ fontWeight: 600 }}>
          Se quitará del inventario ({articulo.cantidad}). Esto no se puede deshacer.
        </Typography>
        {error && <Alert severity="error" sx={{ borderRadius: '16px' }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
          <Button onClick={confirmar} disabled={borrando} sx={sxBotonPeligro}>
            {borrando ? 'Borrando…' : 'Sí, borrar'}
          </Button>
          <Button onClick={onCerrar} disabled={borrando} sx={sxBotonSecundario}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

type FormularioArticuloProps = {
  categoria: CategoriaInventario;
  titulo: string;
  /** Valores actuales al editar */
  inicial?: ArticuloInventario;
  /** Solo al agregar: la descripción se guarda como notas del material */
  conDescripcion?: boolean;
  textoGuardar?: string;
  onGuardar: (nuevo: NuevoArticulo) => void;
  onCancelar: () => void;
};

const sxCampo = { bgcolor: colores.crema, borderRadius: 2 } as const;

/** Entero >= 0 escrito en un campo; null si no es válido */
function enteroDe(texto: string): number | null {
  return /^\d+$/.test(texto.trim()) ? Number(texto.trim()) : null;
}

/**
 * La unidad depende del producto: materiales en piezas, equipo en equipos,
 * consumibles en pzas/cajas/bolsas… y reactivos en frasco + presentación,
 * galón o kit (ver src/utilidades/unidades.ts).
 */
function FormularioArticulo({ categoria, titulo, inicial, conDescripcion = false, textoGuardar = 'Guardar', onGuardar, onCancelar }: FormularioArticuloProps) {
  const reactivoInicial = inicial?.tipoConsumible === 'REACTIVO' ? separarUnidadReactivo(inicial.unidad ?? '') : null;

  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [cantidad, setCantidad] = useState(inicial?.cantidadNumero !== undefined ? String(inicial.cantidadNumero) : '');
  const [minimo, setMinimo] = useState(String(inicial?.minimo ?? 0));
  const [descripcion, setDescripcion] = useState('');
  const [tipoMaterial, setTipoMaterial] = useState<TipoMaterial>(inicial?.tipoMaterial ?? 'UTENSILIO');
  const [tipoConsumible, setTipoConsumible] = useState<TipoConsumible>(inicial?.tipoConsumible ?? 'CONSUMIBLE');
  const [unidadConteo, setUnidadConteo] = useState(
    inicial?.tipoConsumible === 'CONSUMIBLE' && inicial.unidad && unidadValida('CONSUMIBLE', inicial.unidad) ? inicial.unidad : 'pzas',
  );
  const [envase, setEnvase] = useState<EnvaseReactivo>(reactivoInicial?.envase ?? 'frasco');
  const [presentacion, setPresentacion] = useState(reactivoInicial?.presentacion ?? '');

  const esConsumible = categoria === 'consumibles';
  const esReactivo = esConsumible && tipoConsumible === 'REACTIVO';
  const unidad = !esConsumible
    ? categoria === 'equipo'
      ? 'equipos'
      : 'pzas'
    : esReactivo
      ? unirUnidadReactivo(envase, presentacion)
      : unidadConteo;

  const cantidadValida = enteroDe(cantidad);
  const minimoValido = enteroDe(minimo);
  const errorPresentacion =
    esReactivo && envase === 'frasco' && !presentacionValida(presentacion)
      ? `Número y unidad: ${UNIDADES_PRESENTACION.join(', ')} (p. ej. 500 g, 1000 ml)`
      : null;
  const unidadOk = !esConsumible || unidadValida(tipoConsumible, unidad);
  const listo = nombre.trim() !== '' && cantidadValida !== null && minimoValido !== null && unidadOk;

  const enviar = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!listo || cantidadValida === null || minimoValido === null) return;
    onGuardar({
      nombre: nombre.trim(),
      cantidad: `${cantidadValida} ${unidad}`,
      cantidadNumero: cantidadValida,
      unidad,
      minimo: minimoValido,
      descripcion: descripcion.trim() || undefined,
      categoria,
      ...(categoria === 'utensilios' && { tipoMaterial }),
      ...(esConsumible && { tipoConsumible }),
    });
  };

  return (
    <Box component="form" onSubmit={enviar} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 22 }}>
        {titulo}
      </Typography>

      {esConsumible && !inicial && (
        <Box role="group" aria-label="Tipo de consumible" sx={{ display: 'flex', gap: 1 }}>
          {(
            [
              ['CONSUMIBLE', 'Consumible'],
              ['REACTIVO', 'Reactivo'],
            ] as const
          ).map(([valor, texto]) => (
            <Button
              key={valor}
              onClick={() => setTipoConsumible(valor)}
              aria-pressed={tipoConsumible === valor}
              sx={{ borderRadius: 99, px: 2, minHeight: 40, bgcolor: tipoConsumible === valor ? colores.bosque : colores.crema, color: tipoConsumible === valor ? colores.crema : colores.bosque, '&:hover': { bgcolor: tipoConsumible === valor ? colores.verde : colores.papel } }}
            >
              {texto}
            </Button>
          ))}
        </Box>
      )}

      <TextField label="Nombre" placeholder="Ej. Cubrebocas" value={nombre} onChange={(e) => setNombre(e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} sx={sxCampo} />

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1.5 }}>
        <TextField
          label="Cantidad"
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          error={cantidad !== '' && cantidadValida === null}
          helperText={cantidad !== '' && cantidadValida === null ? 'Número entero, 0 o más' : '0 = agotado / dar de baja'}
          slotProps={{
            htmlInput: { min: 0, step: 1, inputMode: 'numeric' },
            input: !esConsumible ? { endAdornment: <InputAdornment position="end">{unidad}</InputAdornment> } : undefined,
          }}
          sx={sxCampo}
        />

        {esConsumible && !esReactivo && (
          <TextField select label="Unidad" value={unidadConteo} onChange={(e) => setUnidadConteo(e.target.value)} sx={sxCampo}>
            {UNIDADES_CONTEO.map((u) => (
              <MenuItem key={u} value={u}>
                {u}
              </MenuItem>
            ))}
          </TextField>
        )}

        {esReactivo && (
          <>
            <TextField select label="Envase" value={envase} onChange={(e) => setEnvase(e.target.value as EnvaseReactivo)} sx={sxCampo}>
              {ENVASES_REACTIVO.map((u) => (
                <MenuItem key={u} value={u}>
                  {u}
                </MenuItem>
              ))}
            </TextField>
            {envase !== 'galón' && (
              <TextField
                label={envase === 'kit' ? 'Contenido (opcional)' : 'Presentación'}
                placeholder={envase === 'kit' ? '3 (100 ml)' : '500 g'}
                value={presentacion}
                onChange={(e) => setPresentacion(e.target.value)}
                error={presentacion !== '' && !!errorPresentacion}
                helperText={errorPresentacion ?? ' '}
                slotProps={{ htmlInput: { maxLength: envase === 'kit' ? 16 : 13 } }}
                sx={sxCampo}
              />
            )}
          </>
        )}

        <TextField
          label="Mínimo de stock"
          type="number"
          value={minimo}
          onChange={(e) => setMinimo(e.target.value)}
          error={minimoValido === null}
          helperText={minimoValido === null ? 'Número entero, 0 o más' : 'Con esto o menos se marca en rojo'}
          slotProps={{ htmlInput: { min: 0, step: 1, inputMode: 'numeric' } }}
          sx={sxCampo}
        />

        {categoria === 'utensilios' && (
          <TextField select label="Tipo de material" value={tipoMaterial} onChange={(e) => setTipoMaterial(e.target.value as TipoMaterial)} sx={sxCampo}>
            {tiposMaterial.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.singular}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Box>

      {conDescripcion && categoria === 'utensilios' && (
        <TextField label="Notas" placeholder="Dónde se guarda, detalles…" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} multiline minRows={2} slotProps={{ htmlInput: { maxLength: 100 } }} sx={sxCampo} />
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
        <Button type="submit" disabled={!listo} sx={sxBotonPrincipal}>
          {textoGuardar}
        </Button>
        <Button onClick={onCancelar} sx={sxBotonSecundario}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}
