import { createTheme } from '@mui/material/styles'

export const fonts = {
  sans: '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
  serif: '"Source Serif 4 Variable", "Source Serif 4", Georgia, "Times New Roman", serif',
  mono: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, Consolas, monospace',
}

export const tokens = {
  light: {
    '--folio-bg': '#F5F4EF',
    '--folio-sidebar': '#EEECE5',
    '--folio-surface': '#FFFFFF',
    '--folio-bubble': '#E9E6DC',
    '--folio-border': 'rgba(31, 30, 27, 0.12)',
    '--folio-border-strong': 'rgba(31, 30, 27, 0.2)',
    '--folio-hover': 'rgba(31, 30, 27, 0.06)',
    '--folio-text': '#1F1E1B',
    '--folio-muted': '#6E6A62',
    '--folio-accent': '#C8643B',
    '--folio-accent-soft': 'rgba(200, 100, 59, 0.12)',
    '--folio-code-bg': '#F0EEE6',
    '--folio-shadow': '0 1px 2px rgba(31, 30, 27, 0.04), 0 8px 28px rgba(31, 30, 27, 0.07)',
  },
  dark: {
    '--folio-bg': '#262624',
    '--folio-sidebar': '#1F1F1D',
    '--folio-surface': '#30302E',
    '--folio-bubble': '#3A3936',
    '--folio-border': 'rgba(236, 233, 226, 0.12)',
    '--folio-border-strong': 'rgba(236, 233, 226, 0.22)',
    '--folio-hover': 'rgba(236, 233, 226, 0.07)',
    '--folio-text': '#ECE9E2',
    '--folio-muted': '#A39F96',
    '--folio-accent': '#E07A52',
    '--folio-accent-soft': 'rgba(224, 122, 82, 0.16)',
    '--folio-code-bg': '#1E1E1C',
    '--folio-shadow': '0 1px 2px rgba(0, 0, 0, 0.25), 0 10px 32px rgba(0, 0, 0, 0.35)',
  },
}

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-color-scheme' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#C8643B', contrastText: '#FFFFFF' },
        background: { default: '#F5F4EF', paper: '#FFFFFF' },
        text: { primary: '#1F1E1B', secondary: '#6E6A62' },
        divider: 'rgba(31, 30, 27, 0.12)',
        error: { main: '#B4432F' },
        success: { main: '#4F7A52' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#E07A52', contrastText: '#1F1E1B' },
        background: { default: '#262624', paper: '#30302E' },
        text: { primary: '#ECE9E2', secondary: '#A39F96' },
        divider: 'rgba(236, 233, 226, 0.12)',
        error: { main: '#E5806B' },
        success: { main: '#8DBB8F' },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: fonts.sans,
    fontSize: 14,
    button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 },
    h1: { fontFamily: fonts.serif, fontWeight: 400 },
    h2: { fontFamily: fonts.serif, fontWeight: 400 },
    h3: { fontFamily: fonts.serif, fontWeight: 400 },
    h4: { fontFamily: fonts.serif, fontWeight: 400, letterSpacing: '-0.01em' },
  },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiButton: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          color: 'var(--folio-muted)',
          '&:hover': { backgroundColor: 'var(--folio-hover)', color: 'var(--folio-text)' },
        },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: false, enterDelay: 400 },
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1F1E1B',
          color: '#F5F4EF',
          fontSize: 12,
          fontWeight: 500,
          borderRadius: 8,
          padding: '6px 10px',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          border: '1px solid var(--folio-border)',
          boxShadow: 'var(--folio-shadow)',
          backgroundImage: 'none',
        },
        list: { padding: 6 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { borderRadius: 8, fontSize: 14, minHeight: 36, '&:hover': { backgroundColor: 'var(--folio-hover)' } },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 18, backgroundImage: 'none', border: '1px solid var(--folio-border)' },
      },
    },
    MuiDrawer: { styleOverrides: { paper: { backgroundImage: 'none' } } },
  },
})
