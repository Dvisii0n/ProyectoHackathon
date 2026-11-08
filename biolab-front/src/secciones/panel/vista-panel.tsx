import type { ArticuloInventario } from 'src/tipos/dominio';
import type { IconifyName } from 'src/components/iconify/register-icons';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { useSesion } from 'src/contexto/sesion';
import { DashboardContent } from 'src/layouts/dashboard';
import { useDatos, useConteo } from 'src/ganchos/usar-datos';
import { Tarjeta, EncabezadoPagina } from 'src/componentes/comunes';
import { colores, crecerX, sxAparecer, sxLevantar, fuenteTitulos } from 'src/componentes/estilos';
import { obtenerReportes, obtenerInventario, obtenerSolicitudes, obtenerHorarioSemana } from 'src/servicios';

import { Iconify } from 'src/components/iconify';

import { estaBajoStock } from '../compartido/explorador-inventario';
import { colorSeveridad, aparienciaSeveridad } from '../compartido/apariencia';

// ----------------------------------------------------------------------
// Panel del coordinador: solo recibe información y decide.
// ----------------------------------------------------------------------

export function VistaPanel() {
  const { usuario, permisos } = useSesion();
  // Los reportes los ve solo el coordinador: el laboratorista no los pide ni los muestra
  const verReportes = permisos.decidirReportes;

  const { datos: reportes } = useDatos(() => (verReportes ? obtenerReportes() : Promise.resolve([])), [verReportes]);
  const { datos: consumibles } = useDatos(() => obtenerInventario('consumibles'));
  const { datos: horario } = useDatos(obtenerHorarioSemana);
  const { datos: solicitudes } = useDatos(() => obtenerSolicitudes());

  const pendientes = reportes?.filter((r) => r.decision === null).length ?? 0;
  const diaHoy = Math.min(Math.max(new Date().getDay() - 1, 0), 4);
  const practicasHoy = horario?.filter((b) => b.dia === diaHoy).length ?? 0;
  const prestados = solicitudes?.filter((s) => s.estado === 'entregada').length ?? 0;
  const porAgotarse = consumibles?.filter(estaBajoStock) ?? [];

  return (
    <DashboardContent maxWidth="xl">
      <EncabezadoPagina
        antetitulo="Laboratorio de Ciencias Biomédicas"
        titulo={`Hola, ${usuario.nombre}`}
        descripcion="Métricas de los laboratorios de un vistazo."
      />

      {/* Números grandes */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 2, mb: 3 }}>
        {verReportes && <TarjetaNumero valor={pendientes} texto="Reportes por decidir" icono="biolab:reporte" fondo={colores.rosa} color={colores.tintoClaro} href="/reportes" retraso={0.15} />}
        <TarjetaNumero valor={practicasHoy} texto="Prácticas hoy" icono="biolab:matraz" fondo={colores.menta} color={colores.verde} href="/horarios" retraso={0.22} />
        <TarjetaNumero valor={prestados} texto="Equipos con material prestado" icono="biolab:caja" fondo={colores.crema} color={colores.bosque} href="/inventario" retraso={0.29} />
        <TarjetaNumero valor={porAgotarse.length} texto="Insumos por agotarse" icono="biolab:alerta" fondo={colores.durazno} color={colores.tinto} href="/inventario" retraso={0.36} />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.25, alignItems: 'flex-start', ...sxAparecer(0.45) }}>
        {/* Reportes por severidad */}
        {verReportes && (
        <Tarjeta sx={{ flex: '1.5 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <EncabezadoTarjeta titulo="Reportes por severidad" enlace="/reportes" textoEnlace="Ver todos" />
          {(['en-orden', 'advertencia', 'dano'] as const).map((severidad) => {
            const apariencia = aparienciaSeveridad[severidad];
            const total = reportes?.filter((r) => r.severidad === severidad).length ?? 0;
            const porcentaje = reportes && reportes.length > 0 ? (total / reportes.length) * 100 : 0;
            return (
              <Box key={severidad} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, fontWeight: 800, fontSize: 15 }}>
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon={apariencia.icono} width={18} sx={{ color: colorSeveridad[severidad] }} />
                    {apariencia.texto}
                  </Box>
                  <span>{total}</span>
                </Box>
                <Box sx={{ height: 12, borderRadius: 99, bgcolor: colores.papelOscuro, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: 1,
                      borderRadius: 99,
                      width: `${porcentaje}%`,
                      bgcolor: colorSeveridad[severidad],
                      transformOrigin: 'left center',
                      animation: `${crecerX} 1.1s .35s cubic-bezier(.2,.8,.2,1) both`,
                    }}
                  />
                </Box>
              </Box>
            );
          })}
          {reportes?.length === 0 && (
            <Typography variant="body2" sx={{ fontWeight: 600, color: colores.verde }}>Aún no hay reportes.</Typography>
          )}
        </Tarjeta>
        )}

        {/* Se está acabando */}
        <Tarjeta sx={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <EncabezadoTarjeta titulo="Se está acabando" enlace="/inventario" textoEnlace="Inventario" />
          {consumibles
            ?.slice()
            .sort((a, b) => nivel(a) - nivel(b))
            .slice(0, 3)
            .map((articulo) => {
              const porcentaje = nivel(articulo);
              return (
                <Box key={articulo.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, fontWeight: 800, fontSize: 15 }}>
                    <span>{articulo.nombre}</span>
                    <Box component="span" sx={{ color: colores.verde }}>{articulo.cantidad}</Box>
                  </Box>
                  <Box sx={{ height: 12, borderRadius: 99, bgcolor: colores.papelOscuro, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: 1,
                        borderRadius: 99,
                        width: `${porcentaje}%`,
                        bgcolor: porcentaje < 25 ? colores.tinto : porcentaje < 35 ? colores.tintoClaro : colores.verde,
                        transformOrigin: 'left center',
                        animation: `${crecerX} 1.1s .35s cubic-bezier(.2,.8,.2,1) both`,
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          {consumibles?.length === 0 && (
            <Typography variant="body2" sx={{ fontWeight: 600, color: colores.verde }}>Aún no hay consumibles registrados.</Typography>
          )}
        </Tarjeta>
      </Box>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

/**
 * Qué tan lleno está (0–100) para la barra: con la API se compara la cantidad
 * contra el doble del mínimo; en los datos de ejemplo viene el porcentaje.
 */
function nivel(articulo: ArticuloInventario) {
  if (articulo.porcentajeRestante !== undefined) return articulo.porcentajeRestante;
  const cantidad = articulo.cantidadNumero ?? 0;
  if (cantidad === 0) return 0;
  if (estaBajoStock(articulo)) return 20;
  const minimo = articulo.minimo ?? 0;
  return minimo > 0 ? Math.min(100, Math.round((cantidad / (minimo * 2)) * 100)) : 100;
}

type TarjetaNumeroProps = {
  valor: number;
  texto: string;
  icono: IconifyName;
  fondo: string;
  color: string;
  href: string;
  retraso: number;
};

function TarjetaNumero({ valor, texto, icono, fondo, color, href, retraso }: TarjetaNumeroProps) {
  const contado = useConteo(valor);

  return (
    <Box sx={{ display: 'flex', ...sxAparecer(retraso) }}>
      <Box
        component={RouterLink}
        href={href}
        sx={{ flex: 1, bgcolor: fondo, borderRadius: '26px', px: 2.75, py: 2.5, display: 'flex', flexDirection: 'column', gap: 0.75, color: colores.bosque, textDecoration: 'none', ...sxLevantar }}
      >
        <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: color, color: colores.crema, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Iconify icon={icono} width={24} />
        </Box>
        <Typography sx={{ mt: 1, fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 50, lineHeight: 1 }}>{contado}</Typography>
        <Typography sx={{ fontWeight: 800, fontSize: 15 }}>{texto}</Typography>
      </Box>
    </Box>
  );
}

function EncabezadoTarjeta({ titulo, enlace, textoEnlace }: { titulo: string; enlace: string; textoEnlace: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
      <Typography component="h3" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 24 }}>
        {titulo}
      </Typography>
      <Box component={RouterLink} href={enlace} sx={{ fontWeight: 800, fontSize: 14, color: colores.tintoClaro, textUnderlineOffset: 3 }}>
        {textoEnlace}
      </Box>
    </Box>
  );
}
