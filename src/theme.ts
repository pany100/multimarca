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

// Brand Colors Definition
const boschColors = {
  // Primary Brand Color
  primary: "#00304B", // Bosch Blue
  // Secondary Brand Colors
  secondary: "#4C90CD", // Bosch Service Blye

  white: "#FFFFFF",

  fillColor: "#E20015",

  // Design Colors - Bosch Blue variations
  boschBlue: {
    100: "#003B6A",
    75: "#215F8B",
    50: "#628CB2",
    25: "#A2BAD2",
  },

  // Bosch Gray
  boschGray: "#808285",
};

// Definimos las opciones del tema para cada modo
const lightThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: boschColors.secondary, // Bosch Blue
      light: "#0076C8",
      dark: "#003F6B",
    },
    secondary: {
      main: boschColors.fillColor,
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: boschColors.boschBlue[25], // Light blue for AppBar
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: boschColors.white,
          borderRight: `1px solid ${boschColors.boschBlue[25]}`,
        },
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
export { boschColors };
