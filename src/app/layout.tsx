import { FetchProvider } from "@/contexts/FetchContext";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import theme from "../theme";
import { initCronJobs } from "./cron";

// Ejecutamos la función de inicialización
if (typeof window === "undefined") {
  initCronJobs();
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MT Service Multimarca",
  description: "MT Service Multimarca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <FetchProvider>{children}</FetchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
