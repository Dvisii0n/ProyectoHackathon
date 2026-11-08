import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { Capi } from 'src/componentes/capi';
import { colores, fondoCuaderno, fuenteTitulos } from 'src/componentes/estilos';

// ----------------------------------------------------------------------

export function NotFoundView() {
  return (
    <Container
      maxWidth={false}
      sx={{
        ...fondoCuaderno,
        py: 10,
        flexGrow: 1,
        gap: 2,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Capi animo="triste" ancho={200} etiqueta="Capi triste" />

      <Typography component="h1" sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 38 }}>
        Capi no encontró esta página
      </Typography>

      <Typography sx={{ maxWidth: 480, fontWeight: 600, color: colores.verde }}>
        Puede que el enlace esté mal escrito o que la página ya no exista.
      </Typography>

      <Button component={RouterLink} href="/" size="large" sx={{ mt: 2, borderRadius: 99, px: 3, bgcolor: colores.bosque, color: colores.crema, '&:hover': { bgcolor: colores.verde } }}>
        Volver al inicio
      </Button>
    </Container>
  );
}
