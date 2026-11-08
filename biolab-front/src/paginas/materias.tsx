import { CONFIG } from 'src/config-global';
import { VistaMaterias } from 'src/secciones/materias';

// ----------------------------------------------------------------------

export default function Pagina() {
  return (
    <>
      <title>{`Materias · ${CONFIG.appName}`}</title>

      <VistaMaterias />
    </>
  );
}
