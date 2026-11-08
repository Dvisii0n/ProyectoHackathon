import 'src/global.css';

import { useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

import { ProveedorSesion } from 'src/contexto/sesion';
import { ProveedorMascota } from 'src/contexto/mascota';
import { ThemeProvider } from 'src/theme/theme-provider';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useSubirAlCambiarDePagina();

  return (
    <ThemeProvider>
      <ProveedorSesion>
        <ProveedorMascota>{children}</ProveedorMascota>
      </ProveedorSesion>
    </ThemeProvider>
  );
}

// ----------------------------------------------------------------------

function useSubirAlCambiarDePagina() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}
