import type { DiaSemana, BloqueHorario, IdLaboratorio } from 'src/tipos/dominio';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

import { useRouter } from 'src/routes/hooks';

import { useSesion } from 'src/contexto/sesion';
import { useDatos } from 'src/ganchos/usar-datos';
import { obtenerHorarioSemana } from 'src/servicios';
import { DashboardContent } from 'src/layouts/dashboard';
import { Tarjeta, EncabezadoPagina } from 'src/componentes/comunes';
import { colores, brincar, sxAparecer, sxLevantar, sombraSuave, fuenteTitulos } from 'src/componentes/estilos';

import { Iconify } from 'src/components/iconify';

import { aparienciaLaboratorio } from '../compartido/apariencia';

// ----------------------------------------------------------------------
// Calendario semanal. El profesor toca un espacio libre para crear una práctica ahí;
// los demás solo ven.
// ----------------------------------------------------------------------

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
const DIAS_COMPLETOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORAS = [8, 9, 10, 11, 12, 13, 14];

type Filtro = IdLaboratorio | 'todos';

export function VistaHorarios() {
  const { permisos } = useSesion();
  const { datos: bloques } = useDatos(obtenerHorarioSemana);

  const [filtro, setFiltro] = useState<Filtro>('todos');
  const router = useRouter();

  const hoy = Math.min(Math.max(new Date().getDay() - 1, 0), 4);
  const puedeReservar = permisos.gestionarPracticas;

  /** Lleva al formulario de nueva práctica con el día y la hora ya puestos */
  const crearPracticaAqui = (dia: DiaSemana, hora: number) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - ((fecha.getDay() + 6) % 7) + dia);
    const dosDigitos = (n: number) => String(n).padStart(2, '0');
    const iso = `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
    const laboratorio = filtro === 'todos' ? '' : `&laboratorio=${filtro}`;
    router.push(`/practicas?nueva=1&fecha=${iso}&hora=${hora}${laboratorio}`);
  };

  return (
    <DashboardContent maxWidth="xl">
      <EncabezadoPagina
        antetitulo="Semana del laboratorio"
        titulo="Horarios"
        descripcion={
          puedeReservar
            ? 'Toca un espacio con "+" para crear una práctica en ese día y hora.'
            : 'Así está ocupado el laboratorio esta semana.'
        }
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5, ...sxAparecer(0.08) }}>
        {(['todos', 'microbiologia', 'fisiologia', 'quimica'] as Filtro[]).map((id) => {
          const activo = filtro === id;
          const color = id === 'todos' ? colores.bosque : aparienciaLaboratorio[id].fondo;
          return (
            <Button
              key={id}
              onClick={() => setFiltro(id)}
              aria-pressed={activo}
              startIcon={<Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: activo ? colores.crema : color }} />}
              sx={{
                borderRadius: 99,
                minHeight: 46,
                px: 2.25,
                bgcolor: activo ? colores.bosque : colores.crema,
                color: activo ? colores.crema : colores.bosque,
                boxShadow: activo ? 'none' : '0 6px 16px -12px rgba(18,42,14,.5)',
                '&:hover': { bgcolor: activo ? colores.verde : colores.papel },
              }}
            >
              {id === 'todos' ? 'Todos' : aparienciaLaboratorio[id].nombre}
            </Button>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, alignItems: 'flex-start' }}>
        <Box sx={{ flex: '3 1 560px', minWidth: 0, bgcolor: colores.crema, borderRadius: '30px', boxShadow: sombraSuave, p: 2.25, overflowX: 'auto', ...sxAparecer(0.14) }}>
          <Box sx={{ minWidth: 620, display: 'grid', gridTemplateColumns: '58px repeat(5, minmax(0, 1fr))', gap: 1 }}>
            <span />
            {DIAS.map((dia, i) => (
              <Box
                key={dia}
                sx={{ textAlign: 'center', py: 1, borderRadius: '14px', fontWeight: 900, fontSize: 15, bgcolor: i === hoy ? colores.bosque : colores.papel, color: i === hoy ? colores.crema : colores.bosque }}
              >
                {i === hoy ? `${dia} · hoy` : dia}
              </Box>
            ))}

            {HORAS.map((hora) => (
              <FilaHora
                key={hora}
                hora={hora}
                bloques={bloques ?? []}
                filtro={filtro}
                puedeReservar={puedeReservar}
                elegido={null}
                onElegir={(dia) => crearPracticaAqui(dia, hora)}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, ...sxAparecer(0.2) }}>
          {puedeReservar && (
            <Box sx={{ bgcolor: colores.salviaClara, borderRadius: '28px', p: 2.75, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 23 }}>
                ¿Nueva práctica?
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>Toca un recuadro con &quot;+&quot; y te llevo al formulario con el día y la hora puestos.</Typography>
              <Button onClick={() => router.push('/practicas?nueva=1')} startIcon={<Iconify icon="biolab:mas" />} sx={{ borderRadius: 99, minHeight: 48, bgcolor: colores.bosque, color: colores.crema, '&:hover': { bgcolor: colores.verde } }}>
                Crear práctica
              </Button>
            </Box>
          )}

          <Tarjeta sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Typography component="h2" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 20 }}>
              ¿Qué significa cada color?
            </Typography>
            {(Object.keys(aparienciaLaboratorio) as IdLaboratorio[]).map((id) => (
              <Box key={id} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontWeight: 700 }}>
                <Box sx={{ width: 24, height: 24, borderRadius: '8px', bgcolor: aparienciaLaboratorio[id].fondo }} />
                {aparienciaLaboratorio[id].nombre}
              </Box>
            ))}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontWeight: 700 }}>
              <Box sx={{ width: 24, height: 24, borderRadius: '8px', border: `2.5px dashed ${colores.salvia}`, bgcolor: colores.crema }} />
              Libre
            </Box>
          </Tarjeta>
        </Box>
      </Box>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

type FilaHoraProps = {
  hora: number;
  bloques: BloqueHorario[];
  filtro: Filtro;
  puedeReservar: boolean;
  elegido: { dia: DiaSemana; hora: number } | null;
  onElegir: (dia: DiaSemana) => void;
};

function FilaHora({ hora, bloques, filtro, puedeReservar, elegido, onElegir }: FilaHoraProps) {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 0.75, fontSize: 14, fontWeight: 800, color: colores.verde }}>
        {hora}:00
      </Box>
      {([0, 1, 2, 3, 4] as DiaSemana[]).map((dia) => {
        const bloque = bloques.find((b) => b.dia === dia && b.hora === hora);

        if (bloque) {
          const apariencia = aparienciaLaboratorio[bloque.laboratorioId];
          const atenuado = filtro !== 'todos' && filtro !== bloque.laboratorioId;
          return (
            <Box
              key={dia}
              sx={{
                minHeight: 64,
                px: 1.4,
                py: 1.1,
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 0.25,
                bgcolor: apariencia.fondo,
                color: apariencia.color,
                opacity: atenuado ? 0.25 : 1,
                ...sxLevantar,
                transition: 'opacity .3s ease, transform .22s ease, box-shadow .22s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>
                <Iconify icon={apariencia.icono} width={15} />
                {bloque.practica}
              </Box>
              <Box sx={{ fontSize: 12, fontWeight: 700, opacity: 0.85 }}>Grupo {bloque.grupo}</Box>
            </Box>
          );
        }

        const esElegido = elegido?.dia === dia && elegido.hora === hora;

        if (!puedeReservar) {
          return <Box key={dia} sx={{ minHeight: 64, borderRadius: '16px', border: `2.5px dashed ${colores.salviaClara}` }} />;
        }

        return (
          <ButtonBase
            key={dia}
            onClick={() => onElegir(dia)}
            aria-pressed={esElegido}
            aria-label={`Apartar ${DIAS_COMPLETOS[dia]} a las ${hora}:00`}
            sx={{
              minHeight: 64,
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: esElegido ? 14 : 22,
              border: esElegido ? 'none' : `2.5px dashed ${colores.salviaClara}`,
              bgcolor: esElegido ? colores.bosque : colores.crema,
              color: esElegido ? colores.crema : colores.verde,
              transition: 'transform .12s ease, background .2s ease',
              '&:hover': esElegido ? {} : { bgcolor: colores.menta, borderColor: colores.verde },
              '&:active': { transform: 'scale(.95)' },
              ...(esElegido && { animation: `${brincar} .45s both` }),
            }}
          >
            {esElegido ? 'Elegido' : '+'}
          </ButtonBase>
        );
      })}
    </>
  );
}
