import { useFetch } from "@/contexts/FetchContext";
import { format } from "date-fns";
import { useState } from "react";

interface RotacionPayload {
  kpis: {
    totalProductosConStock: number;
    productosSinMov90: number;
    productosSinMov180: number;
    productosSinMov365: number;
    diasPromedioStockGlobal: number;
  };
  productos: {
    stockId: number;
    nombre: string;
    marca: string;
    proveedor: string | null;
    sector: string | null;
    stockActual: number;
    unidadesVendidas365: number;
    diasPromedioStock: number | null;
    fechaUltimoMovimiento: string | null;
    diasDesdeUltimoMovimiento: number | null;
  }[];
}

export default function useExportarRotacionStock() {
  const { authFetch } = useFetch();
  const [isLoading, setIsLoading] = useState(false);

  const exportarPdf = async (data: RotacionPayload) => {
    try {
      setIsLoading(true);
      const response = await authFetch(
        "/api/estadisticas/v2/rotacion-stock/generate-pdf",
        {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        },
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `RotacionStock_${format(new Date(), "yyyy-MM-dd")}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting rotacion stock to PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { exportarPdf, isLoading };
}
