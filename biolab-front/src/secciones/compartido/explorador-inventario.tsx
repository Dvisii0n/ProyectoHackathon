import type { IconifyName } from 'src/components/iconify/register-icons';
import type { TipoMaterial, ArticuloInventario, CategoriaInventario } from 'src/tipos/dominio';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

import { ChipEstado } from 'src/componentes/comunes';
import { colores, burbuja, crecerY, sxAparecer, sxLevantar, sombraSuave, fuenteTitulos } from 'src/componentes/estilos';

import { Iconify } from 'src/components/iconify';

import { aparienciaEstadoEquipo } from './apariencia';

// ----------------------------------------------------------------------
// Explorador del inventario: pestañas tipo carpeta por categoría y un
// contenedor que muestra los artículos en tarjetas (por defecto) o en lista.
// Lo usan "Inventario" (laboratorista/coordinador/profe) y "Pedir material" (alumno);
// cada pantalla pone sus propias acciones en cada artículo.
// ----------------------------------------------------------------------

export type VistaArticulos = 'tarjetas' | 'lista';

export const categoriasInventario: { id: CategoriaInventario; nombre: string; icono: IconifyName; fondo: string; color: string }[] = [
  { id: 'consumibles', nombre: 'Consumibles y reactivos', icono: 'biolab:matraz', fondo: colores.menta, color: colores.verde },
  { id: 'equipo', nombre: 'Equipo', icono: 'biolab:microscopio', fondo: '#F2EFE8', color: colores.verde },
  { id: 'utensilios', nombre: 'Materiales', icono: 'biolab:vaso', fondo: colores.durazno, color: colores.cafeTexto },
];

/** Enum categoria_material del back, en plural para filtros y etiquetas */
export const tiposMaterial: { id: TipoMaterial; nombre: string; singular: string }[] = [
  { id: 'VOLUMETRICO', nombre: 'Volumétricos', singular: 'Volumétrico' },
  { id: 'NO_VOLUMETRICO', nombre: 'No volumétricos', singular: 'No volumétrico' },
  { id: 'UTENSILIO', nombre: 'Utensilios', singular: 'Utensilio' },
  { id: 'METAL', nombre: 'Metales', singular: 'Metal' },
];

type ExploradorInventarioProps = {
  categoria: CategoriaInventario;
  onCambiarCategoria: (categoria: CategoriaInventario) => void;
  articulos: ArticuloInventario[] | null;
  vista: VistaArticulos;
  onCambiarVista: (vista: VistaArticulos) => void;
  /** Botones de cada artículo (editar/borrar, o el contador para pedir) */
  acciones?: (articulo: ArticuloInventario) => React.ReactNode;
  /** Marca la tarjeta con borde verde (p. ej. si ya está en la solicitud) */
  resaltar?: (articulo: ArticuloInventario) => boolean;
  /** Contenido extra dentro del contenedor, arriba (avisos, formularios) */
  arriba?: React.ReactNode;
  /** Contenido extra dentro del contenedor, abajo (botón agregar) */
  abajo?: React.ReactNode;
  /** Cuenta por categoría para mostrar en la pestaña (p. ej. cuántos llevas pedidos) */
  contador?: (categoria: CategoriaInventario) => number;
};

export function ExploradorInventario({
  categoria,
  onCambiarCategoria,
  articulos,
  vista,
  onCambiarVista,
  acciones,
  resaltar,
  arriba,
  abajo,
  contador,
}: ExploradorInventarioProps) {
  return (
    <Box sx={sxAparecer(0.08)}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1, pl: 2.25, pr: 1 }}>
        <Box role="tablist" aria-label="Tipo de material" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {categoriasInventario.map((p) => {
            const activa = p.id === categoria;
            const cuenta = contador?.(p.id) ?? 0;
            return (
              <ButtonBase
                key={p.id}
                role="tab"
                aria-selected={activa}
                onClick={() => onCambiarCategoria(p.id)}
                sx={{
                  gap: 1,
                  minHeight: 52,
                  py: 1,
                  pl: 1.25,
                  pr: 2.25,
                  borderRadius: '20px 20px 0 0',
                  fontWeight: 800,
                  fontSize: 15,
                  bgcolor: activa ? colores.crema : 'rgba(255,254,248,.45)',
                  color: activa ? colores.bosque : colores.verde,
                  transform: activa ? 'translateY(2px)' : 'translateY(8px)',
                  transition: 'transform .2s ease',
                }}
              >
                <Box sx={{ width: 30, height: 30, borderRadius: '10px', bgcolor: p.fondo, color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon={p.icono} width={18} />
                </Box>
                {p.nombre}
                {cuenta > 0 && (
                  <Box component="span" sx={{ minWidth: 22, height: 22, px: 0.75, borderRadius: 99, bgcolor: colores.verde, color: colores.crema, fontSize: 12, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cuenta}
                  </Box>
                )}
              </ButtonBase>
            );
          })}
        </Box>

        <Box role="group" aria-label="Cómo ver los artículos" sx={{ display: 'flex', gap: 0.5, p: 0.5, mb: 1, borderRadius: 99, bgcolor: 'rgba(255,254,248,.6)' }}>
          {(
            [
              ['tarjetas', 'Ver como tarjetas', 'biolab:tarjetas'],
              ['lista', 'Ver como lista', 'biolab:lista'],
            ] as const
          ).map(([valor, texto, icono]) => (
            <Tooltip key={valor} title={texto}>
              <IconButton
                aria-label={texto}
                aria-pressed={vista === valor}
                onClick={() => onCambiarVista(valor)}
                sx={{ width: 40, height: 40, bgcolor: vista === valor ? colores.bosque : 'transparent', color: vista === valor ? colores.crema : colores.verde, '&:hover': { bgcolor: vista === valor ? colores.verde : colores.crema } }}
              >
                <Iconify icon={icono} width={19} />
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>

      <Box sx={{ bgcolor: colores.crema, borderRadius: '30px', boxShadow: sombraSuave, p: { xs: 1.75, md: 2.75 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {arriba}

        {articulos?.length === 0 && <Typography sx={{ fontWeight: 700, color: colores.verde, py: 2, textAlign: 'center' }}>No hay nada en esta categoría.</Typography>}

        {vista === 'tarjetas' ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 1.75 }}>
            {articulos?.map((articulo, i) => (
              <TarjetaArticulo key={articulo.id} articulo={articulo} indice={i} acciones={acciones?.(articulo)} resaltado={resaltar?.(articulo) ?? false} />
            ))}
          </Box>
        ) : (
          articulos?.map((articulo, i) => (
            <FilaArticulo key={articulo.id} articulo={articulo} indice={i} acciones={acciones?.(articulo)} resaltado={resaltar?.(articulo) ?? false} />
          ))
        )}

        {abajo}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

type ArticuloProps = {
  articulo: ArticuloInventario;
  indice: number;
  acciones?: React.ReactNode;
  resaltado: boolean;
};

/** Llegó a su mínimo de stock (o, en los datos de ejemplo, queda menos del 35 %) */
export function estaBajoStock(articulo: ArticuloInventario) {
  return articulo.bajoStock ?? (articulo.porcentajeRestante !== undefined && articulo.porcentajeRestante < 35);
}

/** Fondo y borde del recuadro: rojo cuando está bajo en stock */
function sxRecuadro(articulo: ArticuloInventario, resaltado: boolean) {
  const bajo = estaBajoStock(articulo);
  const bordes = [bajo ? `inset 0 0 0 2px ${colores.tinto}` : null, resaltado ? `inset 0 0 0 4px ${colores.verde}` : null].filter(Boolean);
  return { bgcolor: bajo ? colores.rojoSuave : colores.papel, boxShadow: bordes.length > 0 ? bordes.join(', ') : 'none' };
}

function subtituloDe(articulo: ArticuloInventario) {
  const tipo = tiposMaterial.find((t) => t.id === articulo.tipoMaterial)?.singular;
  return [tipo, articulo.cantidad, articulo.descripcion, articulo.ubicacion].filter(Boolean).join(' · ');
}

function TarjetaArticulo({ articulo, indice, acciones, resaltado }: ArticuloProps) {
  return (
    <Box sx={{ display: 'flex', ...sxAparecer(indice * 0.05) }}>
      <Box
        component="article"
        sx={{
          flex: 1,
          p: 2,
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 1,
          ...sxRecuadro(articulo, resaltado),
          ...sxLevantar,
        }}
      >
        <Box sx={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {articulo.porcentajeRestante !== undefined ? <TuboNivel porcentaje={articulo.porcentajeRestante} grande /> : <IconoArticulo articulo={articulo} tamano={64} />}
        </Box>
        <Typography sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 19, lineHeight: 1.2 }}>{articulo.nombre}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: colores.verde }}>{subtituloDe(articulo)}</Typography>
        <EstadoArticulo articulo={articulo} />
        {acciones && <Box sx={{ mt: 'auto', pt: 0.5 }}>{acciones}</Box>}
      </Box>
    </Box>
  );
}

function FilaArticulo({ articulo, indice, acciones, resaltado }: ArticuloProps) {
  return (
    <Box sx={sxAparecer(indice * 0.05)}>
      <Box
        component="article"
        sx={{ px: 2, py: 1.5, borderRadius: '22px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, ...sxRecuadro(articulo, resaltado), ...sxLevantar }}
      >
        {articulo.porcentajeRestante !== undefined ? <TuboNivel porcentaje={articulo.porcentajeRestante} /> : <IconoArticulo articulo={articulo} tamano={52} />}
        <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <Typography sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 20, lineHeight: 1.2 }}>{articulo.nombre}</Typography>
          <Typography sx={{ fontWeight: 600, color: colores.verde }}>{subtituloDe(articulo)}</Typography>
        </Box>
        <EstadoArticulo articulo={articulo} />
        {acciones}
      </Box>
    </Box>
  );
}

/** Tubito de ensayo que se llena según lo que queda, con burbujas */
function TuboNivel({ porcentaje, grande = false }: { porcentaje: number; grande?: boolean }) {
  const bajo = porcentaje < 35;
  const ancho = grande ? 36 : 30;
  const alto = grande ? 70 : 58;

  return (
    <Box role="img" aria-label={`Queda ${porcentaje}%`} sx={{ position: 'relative', width: ancho, height: alto, flexShrink: 0, ml: grande ? 0 : 1 }}>
      <Box sx={{ position: 'absolute', inset: 0, borderRadius: '6px 6px 16px 16px', bgcolor: colores.crema, boxShadow: `inset 0 0 0 2.5px ${colores.salvia}`, overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: `${porcentaje}%`,
            borderRadius: '0 0 14px 14px',
            bgcolor: bajo ? colores.tintoClaro : colores.verdeClaro,
            transformOrigin: 'center bottom',
            animation: `${crecerY} 1.1s .3s cubic-bezier(.2,.8,.2,1) both`,
          }}
        />
      </Box>
      {[
        { left: ancho * 0.3, bottom: 10, tam: 6, retraso: 0 },
        { left: ancho * 0.55, bottom: 6, tam: 4, retraso: 1.1 },
      ].map((b) => (
        <Box key={b.retraso} aria-hidden sx={{ position: 'absolute', left: b.left, bottom: b.bottom, width: b.tam, height: b.tam, borderRadius: '50%', bgcolor: colores.crema, animation: `${burbuja} 2.4s ease-in ${b.retraso}s infinite` }} />
      ))}
      <Box sx={{ position: 'absolute', left: -4, right: -4, top: 0, height: 5, borderRadius: '3px', bgcolor: colores.salvia }} />
    </Box>
  );
}

function IconoArticulo({ articulo, tamano }: { articulo: ArticuloInventario; tamano: number }) {
  const categoria = categoriasInventario.find((p) => p.id === articulo.categoria) ?? categoriasInventario[0];
  const icono: IconifyName =
    articulo.categoria === 'utensilios' && articulo.nombre.toLowerCase().includes('tubo')
      ? 'biolab:tubo'
      : articulo.nombre.toLowerCase().includes('guante')
        ? 'biolab:guante'
        : categoria.icono;

  return (
    <Box sx={{ width: tamano, height: tamano, borderRadius: `${tamano / 3}px`, bgcolor: categoria.fondo, color: categoria.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Iconify icon={icono} width={tamano / 2} />
    </Box>
  );
}

function EstadoArticulo({ articulo }: { articulo: ArticuloInventario }) {
  if (articulo.porcentajeRestante !== undefined) {
    return articulo.porcentajeRestante < 35 ? (
      <ChipEstado texto="Poco stock" icono="biolab:alerta" fondo={colores.tinto} color={colores.crema} />
    ) : (
      <ChipEstado texto="Suficiente" icono="biolab:paloma" fondo={colores.menta} color="#6E2643" />
    );
  }

  if (articulo.cantidadNumero === 0 || /^0\b/.test(articulo.cantidad)) {
    return <ChipEstado texto="Agotado" icono="biolab:alerta" fondo={colores.tinto} color={colores.crema} />;
  }

  if (articulo.bajoStock) {
    return <ChipEstado texto={`Stock bajo · mínimo ${articulo.minimo ?? 0}`} icono="biolab:alerta" fondo={colores.tinto} color={colores.crema} />;
  }

  if (articulo.estado) {
    const apariencia = aparienciaEstadoEquipo[articulo.estado];
    return <ChipEstado texto={apariencia.texto} icono={apariencia.icono} fondo={apariencia.fondo} color={apariencia.color} />;
  }

  return null;
}
