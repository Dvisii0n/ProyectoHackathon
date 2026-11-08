import { CONFIG } from 'src/config-global';

import { NotFoundView } from 'src/sections/error';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Página no encontrada · ${CONFIG.appName}`}</title>

      <NotFoundView />
    </>
  );
}
