import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark', // Tetap dark mode tapi "cerah" (Deep Slate)
    primary: {
      main: '#0062fe', // Electric Blue (Industrial Clean)
      dark: '#0044ff',
    },
    secondary: {
      main: '#f59e0b', // Safety Orange / Amber (Aksen alat berat/perkakas)
    },
    background: {
      default: '#1e293b', // Slate Gray (Warna dasar baja/industri)
      paper: '#334155',   // Lighter Slate (Warna panel kontrol)
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    divider: 'rgba(148, 163, 184, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    button: {
      textTransform: 'none', // Menghilangkan kapital semua agar lebih modern
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // Sedikit lebih tajam agar terasa kokoh
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Menghilangkan gradasi default MUI
          border: '1px solid rgba(148, 163, 184, 0.1)', // Outline tipis ala panel
        },
      },
    },
  },
});