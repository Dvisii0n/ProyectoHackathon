import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { colores, fuenteTitulos } from 'src/componentes/estilos';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import type { NavItem } from '../nav-config-dashboard';

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: NavItem[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 16,
        left: 16,
        height: 'calc(100% - 32px)',
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'calc(var(--layout-nav-vertical-width) - 32px)',
        bgcolor: colores.bosque,
        borderRadius: '30px',
        overflow: 'hidden',
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'hidden',
          bgcolor: colores.bosque,
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, sx }: NavContentProps) {
  const pathname = usePathname();

  return (
    <>
      <MarcaBiolab />

      {slots?.topArea}

      <Scrollbar fillContent>
        <Box
          component="nav"
          sx={[
            {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            component="ul"
            sx={{
              gap: 0.5,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {data.map((item) => {
              const isActived = item.path === pathname;

              return (
                <ListItem disableGutters disablePadding key={item.title}>
                  <ListItemButton
                    disableGutters
                    component={RouterLink}
                    href={item.path}
                    sx={[
                      (theme) => ({
                        pl: 2,
                        py: 1,
                        gap: 2,
                        pr: 1.5,
                        typography: 'body2',
                        fontWeight: 'fontWeightMedium',
                        color: colores.salviaClara,
                        fontSize: 15.5,
                        borderRadius: '18px',
                        minHeight: 52,
                        '&:hover': { bgcolor: varAlpha(theme.vars.palette.grey['400Channel'], 0.14) },
                        '& .icono-menu': { bgcolor: 'rgba(213,220,198,.12)' },
                        ...(isActived && {
                          fontWeight: 800,
                          color: colores.bosque,
                          bgcolor: colores.papel,
                          '&:hover': { bgcolor: colores.papel },
                          '& .icono-menu': { bgcolor: colores.salvia },
                        }),
                      }),
                    ]}
                  >
                    <Box
                      component="span"
                      className="icono-menu"
                      sx={{ width: 38, height: 38, borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      {item.icon}
                    </Box>

                    <Box component="span" sx={{ flexGrow: 1 }}>
                      {item.title}
                    </Box>

                    {item.info && item.info}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}

      <HojaDecorativa />

      <Box sx={{ position: 'relative', my: 2, p: 1.5, borderRadius: '18px', bgcolor: 'rgba(213,220,198,.1)', color: colores.salviaClara, typography: 'caption', fontWeight: 700 }}>
        Prototipo con datos de ejemplo
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

/** Hoja grande y tenue al fondo del menú */
function HojaDecorativa() {
  return (
    <Box
      component="svg"
      viewBox="0 0 200 160"
      aria-hidden
      sx={{ position: 'absolute', left: -24, bottom: 40, width: 200, height: 160, opacity: 0.16, pointerEvents: 'none' }}
    >
      <path d="M20 150C40 80 90 40 170 20C150 90 110 130 20 150Z" fill={colores.salvia} />
      <path d="M20 150C70 110 110 70 170 20" fill="none" stroke={colores.bosque} strokeWidth="3" />
      <path d="M60 120l-6-22M95 92l-4-26M128 62l-2-22M60 120l22 2M95 92l26 0M128 62l22-4" fill="none" stroke={colores.bosque} strokeWidth="2" strokeLinecap="round" />
    </Box>
  );
}

/** Logo de texto de Biolab (cuando haya logo oficial, se cambia aquí) */
function MarcaBiolab() {
  return (
    <Box
      component={RouterLink}
      href="/"
      sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 0.75, pb: 3, textDecoration: 'none' }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '16px',
          bgcolor: colores.salvia,
          color: colores.bosque,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon="biolab:matraz" width={24} />
      </Box>
      <Box>
        <Box sx={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 25, color: colores.crema, lineHeight: 1 }}>
          Biolab
        </Box>
        <Box sx={{ mt: 0.5, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: colores.salvia }}>
          LIC. EN BIOMÉDICA
        </Box>
      </Box>
    </Box>
  );
}
