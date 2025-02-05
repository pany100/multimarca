"use client";

import { PaletteMode } from "@mui/material";
import {
  createTheme as createMuiTheme,
  ThemeOptions,
} from "@mui/material/styles";
import { esES } from "@mui/x-data-grid/locales";

declare module "@mui/material/styles" {
  interface Components {
    MuiDataGrid?: {
      defaultProps?: {
        disableColumnMenu?: boolean;
      };
    };
  }
}

// Definimos las opciones del tema para cada modo
const lightThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: "#005691", // Bosch Blue
      light: "#0076C8",
      dark: "#003F6B",
    },
    secondary: {
      main: "#EA0016", // Bosch Red
      light: "#FF1A1A",
      dark: "#C70012",
    },
    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiDataGrid: {
      defaultProps: {
        disableColumnMenu: true,
      },
    },
  },
};

const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    // Aquí defines colores específicos para el modo oscuro
    background: {
      default: "#303030",
      paper: "#424242",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0bec5",
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
              borderColor: "#005691",
            },
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 4,
          padding: "10px 24px",
        },
      },
    },
    MuiDataGrid: {
      defaultProps: {
        disableColumnMenu: true,
      },
    },
  },
};

// Función para crear el tema basado en el modo
export const createTheme = (mode: PaletteMode) => {
  return createMuiTheme(
    mode === "light" ? lightThemeOptions : darkThemeOptions,
    esES
  );
};

// Tema por defecto (puedes elegir light o dark como predeterminado)
const defaultTheme = createTheme("light");

export default defaultTheme;
