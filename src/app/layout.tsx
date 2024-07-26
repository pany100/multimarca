import { FetchProvider } from "@/contexts/FetchContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
        <FetchProvider>{children}</FetchProvider>
      </body>
    </html>
  );
}
