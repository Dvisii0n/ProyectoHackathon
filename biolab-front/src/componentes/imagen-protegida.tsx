import type { Theme, SxProps } from '@mui/material/styles';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import { urlDeEvidencia } from 'src/servicios';

import { Iconify } from 'src/components/iconify';

import { colores } from './estilos';

// ----------------------------------------------------------------------
// Las evidencias solo se bajan con la sesión iniciada (no hay enlaces
// públicos), así que no se pueden poner directo en un <img src>. Esto las
// baja con el token y las muestra; una URL normal se usa tal cual.
// ----------------------------------------------------------------------

type ImagenProtegidaProps = {
  /** Ruta del API (/evidencias/12) o una URL normal */
  src: string;
  alt: string;
  sx?: SxProps<Theme>;
};

export function ImagenProtegida({ src, alt, sx }: ImagenProtegidaProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let cancelado = false;
    let creada: string | null = null;
    setUrl(null);
    setFallo(false);

    urlDeEvidencia(src)
      .then((resultado) => {
        if (cancelado) {
          if (resultado.startsWith('blob:')) URL.revokeObjectURL(resultado);
          return;
        }
        creada = resultado;
        setUrl(resultado);
      })
      .catch(() => {
        if (!cancelado) setFallo(true);
      });

    return () => {
      cancelado = true;
      if (creada?.startsWith('blob:')) URL.revokeObjectURL(creada);
    };
  }, [src]);

  if (url) return <Box component="img" src={url} alt={alt} sx={[{ width: 1, height: 1, objectFit: 'cover', display: 'block' }, ...(Array.isArray(sx) ? sx : [sx])]} />;

  return (
    <Box role="img" aria-label={fallo ? `No se pudo cargar: ${alt}` : `Cargando: ${alt}`} sx={[{ width: 1, height: 1, bgcolor: colores.papelOscuro, color: colores.tintoClaro, display: 'flex', alignItems: 'center', justifyContent: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Iconify icon={fallo ? 'biolab:alerta' : 'biolab:camara'} width={28} />
    </Box>
  );
}
