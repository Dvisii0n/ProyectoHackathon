import type { IconifyName } from 'src/components/iconify/register-icons';
import type { Calificacion, RubroReporte, CalificacionesReporte } from 'src/tipos/dominio';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';

import { RouterLink } from 'src/routes/components';

import { Capi } from 'src/componentes/capi';
import { useDatos } from 'src/ganchos/usar-datos';
import { MAX_EVIDENCIAS } from 'src/tipos/dominio';
import { DashboardContent } from 'src/layouts/dashboard';
import { crearReporte, obtenerPracticasParaReporte } from 'src/servicios';
import { Confeti, Tarjeta, NumeroPaso, EncabezadoPagina } from 'src/componentes/comunes';
import { colores, brincar, caminar, sxLevantar, fuenteTitulos } from 'src/componentes/estilos';

import { Iconify } from 'src/components/iconify';

import { horarioPractica, aparienciaCalificacion } from '../compartido/apariencia';

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
  const { datos: practicas, cargando: cargandoPracticas } = useDatos(obtenerPracticasParaReporte);

  const [practicaId, setPracticaId] = useState('');
  const [calificaciones, setCalificaciones] = useState<Partial<CalificacionesReporte>>({});
  const [evidencias, setEvidencias] = useState<File[]>([]);
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fotosFallidas, setFotosFallidas] = useState(0);

  const practicaElegida = practicas?.find((p) => p.id === practicaId) ?? null;
  const calificados = rubros.filter((r) => calificaciones[r.id]).length;
  const avance = Math.round((calificados / rubros.length) * 100);
  const completo = calificados === rubros.length && !!practicaElegida;

  const enviar = async () => {
    if (!completo || !practicaElegida) return;
    setEnviando(true);
    setError(null);
    try {
      const resultado = await crearReporte({
        practicaId: practicaElegida.id,
        calificaciones: calificaciones as CalificacionesReporte,
        fotos: evidencias,
        nota: nota.trim() || undefined,
      });
      setFotosFallidas(resultado.fotosFallidas);
      setEnviado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar el reporte');
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    setPracticaId('');
    setCalificaciones({});
    setEvidencias([]);
    setNota('');
    setError(null);
    setFotosFallidas(0);
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
            {fotosFallidas > 0 && (
              <Alert severity="warning" sx={{ borderRadius: '16px' }}>
                {fotosFallidas === 1 ? 'Una foto no se pudo subir' : `${fotosFallidas} fotos no se pudieron subir`}, pero el reporte sí se envió. No lo repitas: avísale al coordinador si hace falta la evidencia.
              </Alert>
            )}
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
            <TituloPaso numero={1}>¿De qué práctica es el reporte?</TituloPaso>
            {practicas && practicas.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: '16px' }}>
                Todavía no hay prácticas que hayan empezado. Cuando un profesor cree una y llegue su hora, podrás reportarla aquí.
              </Alert>
            ) : (
              <TextField
                select
                fullWidth
                label="Práctica"
                value={practicaId}
                onChange={(evento) => setPracticaId(evento.target.value)}
                disabled={cargandoPracticas}
                helperText={practicaElegida ? `${practicaElegida.profesorNombre ? `Profesor: ${practicaElegida.profesorNombre} · ` : ''}${horarioPractica(practicaElegida.inicio, practicaElegida.duracionHoras, practicaElegida.fin)}` : 'Elige la práctica a la que pertenece este reporte'}
                sx={{ bgcolor: colores.papel, borderRadius: 2 }}
              >
                {practicas?.map((practica) => (
                  <MenuItem key={practica.id} value={practica.id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <span>
                        <b>{practica.nombre}</b>
                        {practica.grupo ? ` · Grupo ${practica.grupo}` : ''}
                      </span>
                      <Typography variant="body2" sx={{ color: colores.verde, fontWeight: 600 }}>
                        {horarioPractica(practica.inicio, practica.duracionHoras, practica.fin)}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            )}
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
                            boxShadow: elegida ? '0 10px 20px -12px rgba(90,31,55,.7)' : 'none',
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
            <TituloPaso numero={3}>
              Evidencias{' '}
              <Box component="span" sx={{ fontFamily: 'inherit', fontSize: 15, fontWeight: 700, color: colores.verde }}>
                (opcional · hasta {MAX_EVIDENCIAS} fotos)
              </Box>
            </TituloPaso>
            <Evidencias fotos={evidencias} onCambiar={setEvidencias} />
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

          {error && (
            <Alert severity="error" sx={{ borderRadius: '16px' }}>
              {error}
            </Alert>
          )}

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
                boxShadow: '0 14px 28px -14px rgba(90,31,55,.7)',
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

/** Miniatura de una foto con botón para quitarla */
function Miniatura({ archivo, numero, onQuitar }: { archivo: File; numero: number; onQuitar: () => void }) {
  // La URL se crea y se libera dentro del mismo efecto: así sobrevive al doble montaje de React en desarrollo
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const nueva = URL.createObjectURL(archivo);
    setUrl(nueva);
    return () => URL.revokeObjectURL(nueva);
  }, [archivo]);

  return (
    <Box sx={{ position: 'relative', aspectRatio: '1', borderRadius: '18px', overflow: 'hidden', bgcolor: colores.papelOscuro, animation: `${brincar} .4s both` }}>
      {url && <Box component="img" src={url} alt={`Evidencia ${numero}`} sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block' }} />}
      <IconButton
        aria-label={`Quitar evidencia ${numero}`}
        onClick={onQuitar}
        size="small"
        sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(255,254,251,.92)', color: colores.tinto, '&:hover': { bgcolor: colores.rosa } }}
      >
        <Iconify icon="biolab:cruz" width={16} />
      </IconButton>
    </Box>
  );
}

type EvidenciasProps = {
  fotos: File[];
  onCambiar: (fotos: File[]) => void;
};

/** Hasta MAX_EVIDENCIAS fotos: abre la cámara del celular o el explorador en compu */
function Evidencias({ fotos, onCambiar }: EvidenciasProps) {
  const entrada = useRef<HTMLInputElement>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const lleno = fotos.length >= MAX_EVIDENCIAS;

  const agregar = (lista: FileList | null) => {
    const nuevas = Array.from(lista ?? []).filter((f) => f.type.startsWith('image/'));
    const caben = MAX_EVIDENCIAS - fotos.length;
    setAviso(
      nuevas.length < (lista?.length ?? 0)
        ? 'Solo se pueden subir imágenes.'
        : nuevas.length > caben
          ? `Solo caben ${MAX_EVIDENCIAS} fotos: se agregaron las primeras ${caben}.`
          : null,
    );
    onCambiar([...fotos, ...nuevas.slice(0, caben)]);
    // para poder volver a elegir la misma foto después de quitarla
    if (entrada.current) entrada.current.value = '';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <input ref={entrada} type="file" accept="image/*" multiple hidden onChange={(evento) => agregar(evento.target.files)} />

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 1.5 }}>
        {fotos.map((archivo, i) => (
          <Miniatura key={`${archivo.name}-${archivo.lastModified}-${i}`} archivo={archivo} numero={i + 1} onQuitar={() => onCambiar(fotos.filter((_, j) => j !== i))} />
        ))}

        {!lleno && (
          <ButtonBase
            onClick={() => entrada.current?.click()}
            aria-label="Agregar evidencia"
            sx={{ aspectRatio: '1', borderRadius: '18px', border: `3px dashed ${colores.salvia}`, bgcolor: colores.papel, flexDirection: 'column', gap: 0.75, fontWeight: 800, fontSize: 14, color: colores.bosque, ...sxLevantar }}
          >
            <Box sx={{ width: 46, height: 46, borderRadius: '50%', bgcolor: colores.menta, color: colores.verde, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="biolab:camara" width={24} />
            </Box>
            Agregar foto
          </ButtonBase>
        )}
      </Box>

      <Typography sx={{ fontWeight: 700, color: lleno ? colores.tinto : colores.verde }}>
        {fotos.length} de {MAX_EVIDENCIAS} fotos{lleno ? ' · ya no caben más' : ''}
      </Typography>
      {aviso && <Alert severity="warning" sx={{ borderRadius: '16px' }}>{aviso}</Alert>}
    </Box>
  );
}
