"use client";

import { PaletteMode } from "@mui/material";
import {
  createTheme as createMuiTheme,
  ThemeOptions,
} from "@mui/material/styles";

// Definimos las opciones del tema para cada modo
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    // Aquí puedes definir colores específicos para el modo claro
    // Por ejemplo:
    // primary: { main: '#1976d2' },
    // secondary: { main: '#dc004e' },
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
};

// Función para crear el tema basado en el modo
export const createTheme = (mode: PaletteMode) => {
  return createMuiTheme(
    mode === "light" ? lightThemeOptions : darkThemeOptions
  );
};

// Tema por defecto (puedes elegir light o dark como predeterminado)
const defaultTheme = createTheme("light");

export default defaultTheme;
