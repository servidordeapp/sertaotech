import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const token = (nome) => `var(--${nome})`;

/** Severidade do PrimeVue → família de status do DS. O DS tem três degraus; o Aura pede onze. */
function status(familia, escuro = 600) {
  const [claro, base, forte] = [100, 500, escuro].map((degrau) => token(`${familia}-${degrau}`));

  return {
    50: claro, 100: claro, 200: claro,
    300: base, 400: base, 500: base,
    600: forte, 700: forte, 800: forte, 900: forte, 950: forte,
  };
}

const sucesso = status('cactus');
const aviso = status('honey', 700);
const perigo = status('brick');
const informacao = status('agave');

/**
 * O Aura com os tokens do design system (`site/public/ds/tokens`) no lugar das
 * cores dele. Por `var()`, não por hexadecimal: mudou o token, mudou aqui.
 */
export const tema = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: token('radius-xs'),
      sm: token('radius-sm'),
      md: token('radius-md'),
      lg: token('radius-lg'),
      xl: token('radius-xl'),
    },
    green: sucesso,
    emerald: sucesso,
    yellow: aviso,
    orange: aviso,
    red: perigo,
    blue: informacao,
    sky: informacao,
  },
  semantic: {
    focusRing: { width: '2px', color: token('focus-ring') },
    // Sem terra-200/300/800/900 no DS: os degraus que o Aura usa de verdade são
    // 500 (base), 600 (hover), 700 (ativo) e 50/100 (destaque).
    primary: {
      50: token('terra-100'),
      100: token('terra-100'),
      200: token('terra-100'),
      300: token('terra-400'),
      400: token('terra-400'),
      500: token('brand-primary'),
      600: token('brand-primary-hover'),
      700: token('brand-primary-active'),
      800: token('espresso-700'),
      900: token('espresso-800'),
      950: token('espresso-900'),
    },
    formField: {
      focusRing: { shadow: token('shadow-focus') },
    },
    overlay: {
      select: { shadow: token('shadow-md') },
      popover: { shadow: token('shadow-md') },
      modal: { shadow: token('shadow-lg') },
      navigation: { shadow: token('shadow-md') },
    },
    colorScheme: {
      light: {
        // 500 é espresso-600 de propósito: espresso-500 reprova AA sobre o creme.
        surface: {
          0: token('surface-card'),
          50: token('surface-page'),
          100: token('surface-hover'),
          200: token('surface-sunken'),
          300: token('border-default'),
          400: token('border-strong'),
          500: token('text-muted'),
          600: token('text-muted'),
          700: token('text-body'),
          800: token('text-body'),
          900: token('text-strong'),
          950: token('espresso-950'),
        },
        primary: { contrastColor: token('text-on-brand') },
        mask: { background: 'rgba(31, 19, 5, 0.55)' },
        formField: { focusBorderColor: token('focus-ring') },
      },
    },
  },
  components: {
    button: { root: { borderRadius: token('radius-pill') } },
    tag: { root: { borderRadius: token('radius-pill') } },
    datatable: {
      headerCell: { background: token('sand-100'), padding: '0.625rem 0.875rem' },
      bodyCell: { padding: '0.875rem' },
    },
    togglebutton: {
      root: { borderRadius: token('radius-pill') },
      content: { borderRadius: token('radius-pill'), padding: '0.375rem 0.75rem', checkedShadow: token('shadow-xs') },
      colorScheme: {
        light: {
          root: {
            background: token('surface-sunken'),
            checkedBackground: token('surface-sunken'),
            hoverBackground: token('surface-sunken'),
            borderColor: token('surface-sunken'),
            checkedBorderColor: token('surface-sunken'),
          },
        },
      },
    },
    selectbutton: { root: { borderRadius: token('radius-pill') } },
    progressbar: {
      colorScheme: { light: { root: { background: token('surface-sunken') } } },
    },
  },
});
