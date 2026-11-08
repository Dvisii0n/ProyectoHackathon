import type { IconifyName } from 'src/components/iconify/register-icons';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { Capi } from 'src/componentes/capi';
import { useSesion } from 'src/contexto/sesion';
import { useMascota } from 'src/contexto/mascota';
import { DashboardContent } from 'src/layouts/dashboard';
import { useDatos, useConteo } from 'src/ganchos/usar-datos';
import { Tarjeta, ChipEstado, EncabezadoPagina } from 'src/componentes/comunes';
import { vapor, colores, crecerX, sxAparecer, sxLevantar, fuenteTitulos } from 'src/componentes/estilos';
import { obtenerReportes, obtenerInventario, obtenerSolicitudes, obtenerHorarioSemana } from 'src/servicios';

import { Iconify } from 'src/components/iconify';

import { fechaAmigable, colorSeveridad, aparienciaSeveridad } from '../compartido/apariencia';

// ----------------------------------------------------------------------
// Panel del coordinador: solo recibe información y decide.
// ----------------------------------------------------------------------

export function VistaPanel() {
  const { usuario } = useSesion();
  const { animoSimulado, simularAnimo } = useMascota();

  const { datos: reportes } = useDatos(obtenerReportes);
  const { datos: consumibles } = useDatos(() => obtenerInventario('consumibles'));
  const { datos: horario } = useDatos(obtenerHorarioSemana);
  const { datos: solicitudes } = useDatos(() => obtenerSolicitudes());

  const triste = animoSimulado === 'triste';
  const pendientes = reportes?.filter((r) => r.decision === null).length ?? 0;
  const diaHoy = Math.min(Math.max(new Date().getDay() - 1, 0), 4);
  const practicasHoy = horario?.filter((b) => b.dia === diaHoy).length ?? 0;
  const prestados = solicitudes?.filter((s) => s.estado === 'entregada').length ?? 0;
  const porAgotarse = consumibles?.filter((c) => (c.porcentajeRestante ?? 100) < 35) ?? [];

  return (
    <DashboardContent maxWidth="xl">
      <EncabezadoPagina
        antetitulo="Laboratorio de Biomédica"
        titulo={`Hola, ${usuario.nombre}`}
        descripcion="Esto pasó en los laboratorios. Tú solo decides; el resto lo hace el laboratorista."
      />

      {/* Ánimo del laboratorio */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: colores.salviaClara,
          borderRadius: '34px',
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 3,
          mb: 3,
          ...sxAparecer(0.1),
        }}
      >
        <Box sx={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative' }}>
          <Box component="span" sx={{ alignSelf: 'flex-start', px: 1.75, py: 0.75, borderRadius: 99, bgcolor: colores.crema, fontSize: 12, fontWeight: 900, color: colores.tintoClaro, letterSpacing: '.08em' }}>
            ÁNIMO DEL LABORATORIO
          </Box>
          <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: { xs: 28, md: 34 }, lineHeight: 1.1 }}>
            {triste ? 'Capi perdió su mandarina: hubo daños esta semana' : 'Todo tranquilo, como capibara en aguas termales'}
          </Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 600 }}>
            {triste
              ? 'Hay reportes con material roto. La racha del laboratorio volvió a cero.'
              : 'Esta semana las aulas se entregaron limpias y con el material completo.'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25, mt: 1 }}>
            <Button
              component={RouterLink}
              href="/reportes"
              size="large"
              endIcon={<Iconify icon="biolab:flecha" />}
              sx={{ borderRadius: 99, px: 3, bgcolor: colores.bosque, color: colores.crema, '&:hover': { bgcolor: colores.verde } }}
            >
              Revisar {pendientes} reportes
            </Button>
            <Typography component="span" sx={{ ml: 0.75, fontSize: 13, fontWeight: 800 }}>
              Simular semana:
            </Typography>
            <BotonSimular activo={!triste} onClick={() => simularAnimo(null)}>
              Buena
            </BotonSimular>
            <BotonSimular activo={triste} onClick={() => simularAnimo('triste')}>
              Con daños
            </BotonSimular>
          </Box>
        </Box>

        <EscenaTermal triste={triste} />
      </Box>

      {/* Números grandes */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 2, mb: 3 }}>
        <TarjetaNumero valor={pendientes} texto="Reportes por decidir" icono="biolab:reporte" fondo={colores.rosa} color={colores.tintoClaro} href="/reportes" retraso={0.15} />
        <TarjetaNumero valor={practicasHoy} texto="Prácticas hoy" icono="biolab:matraz" fondo={colores.menta} color={colores.verde} href="/horarios" retraso={0.22} />
        <TarjetaNumero valor={prestados} texto="Equipos con material prestado" icono="biolab:caja" fondo={colores.crema} color={colores.bosque} href="/inventario" retraso={0.29} />
        <TarjetaNumero valor={porAgotarse.length} texto="Insumos por agotarse" icono="biolab:alerta" fondo={colores.durazno} color={colores.tinto} href="/inventario" retraso={0.36} />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.25, alignItems: 'flex-start', ...sxAparecer(0.45) }}>
        {/* Lo último que llegó */}
        <Tarjeta sx={{ flex: '1.5 1 380px', minWidth: 0 }}>
          <EncabezadoTarjeta titulo="Lo último que llegó" enlace="/reportes" textoEnlace="Ver todos" />
          {reportes?.slice(0, 3).map((reporte) => {
            const apariencia = aparienciaSeveridad[reporte.severidad];
            return (
              <Box key={reporte.id} sx={{ display: 'flex', gap: 1.75 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: colorSeveridad[reporte.severidad], color: colores.crema, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Iconify icon={apariencia.icono} width={18} />
                  </Box>
                  <Box sx={{ flex: 1, width: 2, bgcolor: '#E2E4D4', my: 0.5 }} />
                </Box>
                <Box
                  component={RouterLink}
                  href="/reportes"
                  sx={{ flex: 1, minWidth: 0, mb: 1.5, px: 2, py: 1.5, borderRadius: '18px', bgcolor: colores.papel, color: 'inherit', textDecoration: 'none', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25, ...sxLevantar }}
                >
                  <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800 }}>{reporte.titulo}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colores.verde }}>
                      {reporte.nombrePractica} · {fechaAmigable(reporte.fecha)}
                    </Typography>
                  </Box>
                  <ChipEstado texto={apariencia.texto} fondo={apariencia.fondo} color={apariencia.color} />
                </Box>
              </Box>
            );
          })}
        </Tarjeta>

        {/* Se está acabando */}
        <Tarjeta sx={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <EncabezadoTarjeta titulo="Se está acabando" enlace="/inventario" textoEnlace="Inventario" />
          {consumibles
            ?.slice()
            .sort((a, b) => (a.porcentajeRestante ?? 100) - (b.porcentajeRestante ?? 100))
            .slice(0, 3)
            .map((articulo) => {
              const porcentaje = articulo.porcentajeRestante ?? 100;
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
        </Tarjeta>
      </Box>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function BotonSimular({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      onClick={onClick}
      aria-pressed={activo}
      sx={{
        borderRadius: 99,
        minHeight: 44,
        px: 2,
        bgcolor: activo ? colores.bosque : 'rgba(255,254,248,.8)',
        color: activo ? colores.crema : colores.bosque,
        '&:hover': { bgcolor: activo ? colores.verde : colores.crema },
      }}
    >
      {children}
    </Button>
  );
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

/** Capi en aguas termales (o bajo una nube si hubo daños) */
function EscenaTermal({ triste }: { triste: boolean }) {
  const agua = triste ? '#BCC7C0' : '#B4D0C3';
  const aguaFondo = triste ? '#9AA79F' : '#8FAF9F';

  return (
    <Box sx={{ position: 'relative', width: 290, height: 218, flex: '0 0 auto', mx: 'auto' }} role="img" aria-label={triste ? 'Capi triste bajo una nube' : 'Capi feliz en aguas termales'}>
      <Box component="svg" viewBox="0 0 280 210" sx={{ position: 'absolute', inset: 0, width: 1, height: 1 }} aria-hidden>
        <ellipse cx="140" cy="168" rx="126" ry="34" fill={aguaFondo} />
        <ellipse cx="140" cy="162" rx="116" ry="28" fill={agua} />
        <circle cx="22" cy="160" r="12" fill="#A3A891" />
        <circle cx="44" cy="180" r="10" fill="#B9C4A0" />
        <circle cx="254" cy="158" r="13" fill="#A3A891" />
        <circle cx="236" cy="182" r="9" fill="#B9C4A0" />
        {!triste &&
          [
            { d: 'M42 120c-8-10 8-16 0-28', retraso: 0 },
            { d: 'M228 122c-8-10 8-16 0-28', retraso: 1.1 },
            { d: 'M246 100c-6-8 6-12 0-22', retraso: 2.1 },
          ].map((v) => (
            <Box
              key={v.d}
              component="path"
              d={v.d}
              fill="none"
              stroke={colores.crema}
              strokeWidth={5}
              strokeLinecap="round"
              sx={{ transformBox: 'fill-box', animation: `${vapor} 3.2s ease-in-out ${v.retraso}s infinite` }}
            />
          ))}
      </Box>

      <Capi animo={triste ? 'triste' : 'feliz'} ancho={145} sx={{ position: 'absolute', left: 72, top: 68 }} />

      {triste && (
        <Box component="svg" viewBox="0 0 280 210" sx={{ position: 'absolute', inset: 0, width: 1, height: 1 }} aria-hidden>
          <path d="M74 44a14 14 0 0 1 26-8a16 16 0 0 1 30 6a11 11 0 0 1 0 22h-56a10 10 0 0 1 0-20z" fill="#C9CEC0" />
          <path d="M84 70v8M110 72v8M134 70v8" stroke="#8FBCD4" strokeWidth="3" strokeLinecap="round" />
        </Box>
      )}

      {/* Agua de enfrente: tapa las patas para que parezca que está sumergido */}
      <Box component="svg" viewBox="0 0 280 210" sx={{ position: 'absolute', inset: 0, width: 1, height: 1 }} aria-hidden>
        <path d="M24 162Q140 128 256 162A116 28 0 0 1 24 162Z" fill={agua} />
        <path d="M100 168q10-5 20 0t20 0t20 0" fill="none" stroke={colores.crema} strokeWidth="3" strokeLinecap="round" opacity=".7" />
      </Box>
    </Box>
  );
}
