import type { IconifyName } from 'src/components/iconify/register-icons';
import type { Calificacion, RubroReporte, CalificacionesReporte } from 'src/tipos/dominio';

import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

import { RouterLink } from 'src/routes/components';

import { Capi } from 'src/componentes/capi';
import { useDatos } from 'src/ganchos/usar-datos';
import { DashboardContent } from 'src/layouts/dashboard';
import { crearReporte, obtenerPracticasDeHoy } from 'src/servicios';
import { Confeti, Tarjeta, NumeroPaso, EncabezadoPagina } from 'src/componentes/comunes';
import { colores, brincar, caminar, sxLevantar, fuenteTitulos } from 'src/componentes/estilos';

import { Iconify } from 'src/components/iconify';

import { aparienciaCalificacion } from '../compartido/apariencia';

// ----------------------------------------------------------------------
// Reporte de aula en menos de un minuto (laboratorista o profesor).
// ----------------------------------------------------------------------

const rubros: { id: RubroReporte; nombre: string; icono: IconifyName }[] = [
  { id: 'limpieza', nombre: 'Limpieza', icono: 'biolab:escoba' },
  { id: 'material', nombre: 'Material completo', icono: 'biolab:caja' },
  { id: 'equipo', nombre: 'Equipo funcionando', icono: 'biolab:microscopio' },
  { id: 'orden', nombre: 'Mesas y sillas', icono: 'biolab:mesa' },
];

const opciones: Calificacion[] = ['bien', 'regular', 'mal'];

export function VistaNuevoReporte() {
  const { datos: practicas } = useDatos(obtenerPracticasDeHoy);

  const [practicaId, setPracticaId] = useState<string | null>(null);
  const [calificaciones, setCalificaciones] = useState<Partial<CalificacionesReporte>>({});
  const [fotoLlegada, setFotoLlegada] = useState<File | null>(null);
  const [fotoEntrega, setFotoEntrega] = useState<File | null>(null);
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const practicaElegida = practicaId ?? practicas?.[0]?.id ?? null;
  const calificados = rubros.filter((r) => calificaciones[r.id]).length;
  const avance = Math.round((calificados / rubros.length) * 100);
  const completo = calificados === rubros.length && !!practicaElegida;

  const enviar = async () => {
    if (!completo || !practicaElegida) return;
    setEnviando(true);
    try {
      await crearReporte({
        practicaId: practicaElegida,
        calificaciones: calificaciones as CalificacionesReporte,
        fotos: [fotoLlegada, fotoEntrega].filter((f): f is File => !!f),
        nota: nota.trim() || undefined,
      });
      setEnviado(true);
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    setCalificaciones({});
    setFotoLlegada(null);
    setFotoEntrega(null);
    setNota('');
    setEnviado(false);
  };

  return (
    <DashboardContent maxWidth="lg">
      <EncabezadoPagina
        antetitulo="Al terminar la práctica"
        titulo="¿Cómo quedó el aula?"
        descripcion="Menos de un minuto. El coordinador lo recibe al instante."
      />

      {enviado ? (
        <Box sx={{ position: 'relative', overflow: 'hidden', maxWidth: 880, bgcolor: colores.salviaClara, borderRadius: '34px', p: 4.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3.5, animation: `${brincar} .45s both` }}>
          <Confeti />
          <Capi animo="celebrando" ancho={200} flotando etiqueta="Capi celebrando" />
          <Box sx={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative' }}>
            <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 36, lineHeight: 1.1 }}>
              ¡Reporte enviado!
            </Typography>
            <Typography sx={{ fontSize: 17, fontWeight: 600 }}>
              El coordinador ya lo tiene en su bandeja. Gracias por cuidar el laboratorio; Capi te regala una mandarina.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.75 }}>
              <Button onClick={reiniciar} size="large" sx={{ borderRadius: 99, px: 3, bgcolor: colores.crema, color: colores.bosque }}>
                Hacer otro reporte
              </Button>
              <Button component={RouterLink} href="/inventario" size="large" sx={{ borderRadius: 99, px: 3, bgcolor: colores.bosque, color: colores.crema, '&:hover': { bgcolor: colores.verde } }}>
                Ir al inventario
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 880 }}>
          {/* Capi camina hacia la meta conforme se califica */}
          <Box sx={{ bgcolor: colores.salviaClara, borderRadius: '28px', px: 3.5, pt: 2.25, pb: 2.75 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, fontWeight: 800, mb: 1 }}>
              <span>{completo ? '¡Todo calificado! Ya puedes enviarlo' : `Llevas ${calificados} de ${rubros.length}`}</span>
              <Box component="span" sx={{ color: colores.verde }}>Meta: enviar</Box>
            </Box>
            <Box sx={{ position: 'relative', mx: '30px', height: 66 }}>
              <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 6, height: 12, borderRadius: 99, bgcolor: colores.crema }} />
              <Box sx={{ position: 'absolute', left: 0, bottom: 6, height: 12, borderRadius: 99, bgcolor: colores.verde, width: `${avance}%`, transition: 'width .5s cubic-bezier(.2,.8,.2,1)' }} />
              <Box aria-hidden component="svg" viewBox="0 0 34 52" width={34} height={52} sx={{ position: 'absolute', right: -26, bottom: 0 }}>
                <path d="M6 50V4" stroke={colores.bosque} strokeWidth="3" strokeLinecap="round" />
                <path d="M7 5h22l-6 7 6 7H7z" fill={colores.tinto} />
              </Box>
              <Box sx={{ position: 'absolute', bottom: 10, left: `${avance}%`, transform: 'translateX(-50%)', transition: 'left .55s cubic-bezier(.2,.8,.2,1)' }}>
                <Box sx={{ animation: `${caminar} .9s ease-in-out infinite` }}>
                  <Capi ancho={70} accesorios={{}} mirarDerecha />
                </Box>
              </Box>
            </Box>
          </Box>

          <Tarjeta retraso={0.14}>
            <TituloPaso numero={1}>¿De qué práctica es?</TituloPaso>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
              {practicas?.map((practica) => {
                const activa = practica.id === practicaElegida;
                return (
                  <Button
                    key={practica.id}
                    onClick={() => setPracticaId(practica.id)}
                    aria-pressed={activa}
                    sx={{ borderRadius: 99, minHeight: 48, px: 2.5, bgcolor: activa ? colores.bosque : colores.papel, color: activa ? colores.crema : colores.bosque, '&:hover': { bgcolor: activa ? colores.verde : colores.papelOscuro } }}
                  >
                    {practica.nombre} · {practica.grupo}
                  </Button>
                );
              })}
            </Box>
          </Tarjeta>

          <Tarjeta retraso={0.2}>
            <TituloPaso numero={2}>Califica con una carita</TituloPaso>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {rubros.map((rubro) => (
                <Box key={rubro.id} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, py: 1.25, pl: 2.25, pr: 1.5, borderRadius: '22px', bgcolor: colores.papel }}>
                  <Box sx={{ flex: '1 1 170px', display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800, fontSize: 17 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '14px', bgcolor: colores.crema, color: colores.verde, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Iconify icon={rubro.icono} width={22} />
                    </Box>
                    {rubro.nombre}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {opciones.map((opcion) => {
                      const apariencia = aparienciaCalificacion[opcion];
                      const elegida = calificaciones[rubro.id] === opcion;
                      return (
                        <ButtonBase
                          key={opcion}
                          onClick={() => setCalificaciones((anterior) => ({ ...anterior, [rubro.id]: opcion }))}
                          aria-pressed={elegida}
                          aria-label={`${rubro.nombre}: ${apariencia.texto}`}
                          sx={{
                            flexDirection: 'column',
                            gap: 0.25,
                            width: 74,
                            minHeight: 68,
                            py: 1,
                            borderRadius: '20px',
                            fontWeight: 800,
                            fontSize: 12,
                            bgcolor: elegida ? apariencia.color : colores.crema,
                            color: elegida ? colores.crema : colores.verde,
                            boxShadow: elegida ? '0 10px 20px -12px rgba(18,42,14,.7)' : 'none',
                            transition: 'transform .12s ease, background .2s ease',
                            '&:active': { transform: 'scale(.94)' },
                          }}
                        >
                          <Iconify key={elegida ? 'si' : 'no'} icon={apariencia.icono} width={30} sx={elegida ? { animation: `${brincar} .45s both` } : undefined} />
                          {apariencia.texto}
                        </ButtonBase>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </Tarjeta>

          <Tarjeta retraso={0.26}>
            <TituloPaso numero={3}>Toma fotos del aula</TituloPaso>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1.75 }}>
              <SubirFoto texto="Al llegar" archivo={fotoLlegada} onCambiar={setFotoLlegada} fondo={colores.menta} color={colores.verde} />
              <SubirFoto texto="Al entregar" archivo={fotoEntrega} onCambiar={setFotoEntrega} fondo={colores.rosa} color={colores.tintoClaro} />
            </Box>
          </Tarjeta>

          <Tarjeta retraso={0.32}>
            <TituloPaso numero={4}>
              ¿Algo más?{' '}
              <Box component="span" sx={{ fontFamily: 'inherit', fontSize: 15, fontWeight: 700, color: colores.verde }}>
                (opcional)
              </Box>
            </TituloPaso>
            <TextField
              value={nota}
              onChange={(evento) => setNota(evento.target.value)}
              placeholder="Por ejemplo: se rompió un tubo de ensayo"
              multiline
              minRows={3}
              fullWidth
            />
          </Tarjeta>

          <Box>
            <Button
              onClick={enviar}
              disabled={!completo || enviando}
              size="large"
              startIcon={<Iconify icon="biolab:enviar" />}
              sx={{
                borderRadius: 99,
                minHeight: 58,
                px: 3.75,
                fontSize: 18,
                bgcolor: colores.verde,
                color: colores.crema,
                boxShadow: '0 14px 28px -14px rgba(18,42,14,.7)',
                '&:hover': { bgcolor: colores.bosque },
                '&.Mui-disabled': { bgcolor: colores.salviaClara, color: colores.verde },
              }}
            >
              {enviando ? 'Enviando…' : 'Enviar al coordinador'}
            </Button>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function TituloPaso({ numero, children }: { numero: number; children: React.ReactNode }) {
  return (
    <Typography component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 23 }}>
      <NumeroPaso numero={numero} />
      <span>{children}</span>
    </Typography>
  );
}

type SubirFotoProps = {
  texto: string;
  archivo: File | null;
  onCambiar: (archivo: File | null) => void;
  fondo: string;
  color: string;
};

/** Botón grande que abre la cámara del celular (o el explorador en compu) */
function SubirFoto({ texto, archivo, onCambiar, fondo, color }: SubirFotoProps) {
  const entrada = useRef<HTMLInputElement>(null);

  return (
    <ButtonBase
      onClick={() => entrada.current?.click()}
      sx={{ minHeight: 140, borderRadius: '22px', border: `3px dashed ${colores.salvia}`, bgcolor: colores.papel, flexDirection: 'column', gap: 1, fontWeight: 800, fontSize: 16, color: colores.bosque, ...sxLevantar }}
    >
      <input
        ref={entrada}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(evento) => onCambiar(evento.target.files?.[0] ?? null)}
      />
      <Box sx={{ width: 58, height: 58, borderRadius: '50%', bgcolor: archivo ? colores.verde : fondo, color: archivo ? colores.crema : color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Iconify icon={archivo ? 'biolab:paloma' : 'biolab:camara'} width={30} />
      </Box>
      {archivo ? `${texto}: lista` : texto}
    </ButtonBase>
  );
}
