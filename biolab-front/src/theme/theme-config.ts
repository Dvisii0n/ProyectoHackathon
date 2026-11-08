import type { CommonColors } from '@mui/material/styles';

import type { ThemeCssVariables } from './types';
import type { PaletteColorNoChannels } from './core/palette';

// ----------------------------------------------------------------------

type ThemeConfig = {
  classesPrefix: string;
  cssVariables: ThemeCssVariables;
  fontFamily: Record<'primary' | 'secondary', string>;
  palette: Record<
    'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error',
    PaletteColorNoChannels
  > & {
    common: Pick<CommonColors, 'black' | 'white'>;
    grey: Record<
      '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
      string
    >;
  };
};

export const themeConfig: ThemeConfig = {
  /** **************************************
   * Base
   *************************************** */
  classesPrefix: 'biolab',
  /** **************************************
   * Typography
   *************************************** */
  fontFamily: {
    primary: 'Nunito Variable',
    secondary: 'Fraunces Variable',
  },
  /** **************************************
   * Palette
   *************************************** */
  palette: {
    // Verde bosque: color principal de Biolab
    primary: {
      lighter: '#DDE4CC',
      light: '#7E9A6A',
      main: '#41553E',
      dark: '#2E4429',
      darker: '#122A0E',
      contrastText: '#FFFEF8',
    },
    // Tinto: acentos de marca, sanciones y alertas importantes
    secondary: {
      lighter: '#EBD9D5',
      light: '#A86A6A',
      main: '#854949',
      dark: '#671B1C',
      darker: '#4A1213',
      contrastText: '#FFFEF8',
    },
    info: {
      lighter: '#DCEBF0',
      light: '#8FBCD4',
      main: '#4F8BA8',
      dark: '#2F5F78',
      darker: '#173A4C',
      contrastText: '#FFFEF8',
    },
    success: {
      lighter: '#DDE4CC',
      light: '#9CB07E',
      main: '#5E7E4E',
      dark: '#41553E',
      darker: '#122A0E',
      contrastText: '#FFFEF8',
    },
    // Mandarina de Capi: advertencias
    warning: {
      lighter: '#F2E2D2',
      light: '#E8964A',
      main: '#C27536',
      dark: '#7A3F22',
      darker: '#4E2614',
      contrastText: '#FFFEF8',
    },
    error: {
      lighter: '#EBD9D5',
      light: '#A86A6A',
      main: '#8E2B2C',
      dark: '#671B1C',
      darker: '#4A1213',
      contrastText: '#FFFEF8',
    },
    // Grises cálidos (crema y salvia) en lugar de grises fríos
    grey: {
      '50': '#FFFEF8',
      '100': '#F7F5EA',
      '200': '#F4F2E4',
      '300': '#E2E4D4',
      '400': '#D5DCC6',
      '500': '#A3A891',
      '600': '#6E745F',
      '700': '#41553E',
      '800': '#1F3A1A',
      '900': '#122A0E',
    },
    common: { black: '#000000', white: '#FFFFFF' },
  },
  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
};
