"use client";

import { FetchProvider } from "@/contexts/FetchContext";
import { PaletteMode } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { createTheme } from "../theme";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mode, setMode] = useState<PaletteMode>("light");
  const theme = useMemo(() => createTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FetchProvider>{children}</FetchProvider>
    </ThemeProvider>
  );
}
