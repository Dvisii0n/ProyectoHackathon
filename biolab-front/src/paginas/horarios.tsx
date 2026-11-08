import { CONFIG } from 'src/config-global';
import { VistaHorarios } from 'src/secciones/horarios';

// ----------------------------------------------------------------------

export default function Pagina() {
  return (
    <>
      <title>{`Horarios y reservas · ${CONFIG.appName}`}</title>

      <VistaHorarios />
    </>
  );
}
