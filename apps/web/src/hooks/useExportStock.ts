import { useFetch } from "@/contexts/FetchContext";
import { format } from "date-fns";
import { useState } from "react";

export type ExportStockFilters = {
  query?: string;
  proveedorId?: number | null;
  sector?: string;
  needsRestock?: boolean;
};

function useExportStock() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFiltered, setIsLoadingFiltered] = useState(false);
  const { authFetch } = useFetch();

  const fetchStock = async (filters?: ExportStockFilters) => {
    const url = new URL("/api/stock/export-all", window.location.origin);
    if (filters?.query) url.searchParams.set("query", filters.query);
    if (filters?.proveedorId)
      url.searchParams.set("proveedorId", String(filters.proveedorId));
    if (filters?.sector) url.searchParams.set("sector", filters.sector);
    if (filters?.needsRestock) url.searchParams.set("needsRestock", "true");
    const response = await authFetch(url.toString());
    return response.json();
  };

  const downloadPdf = async (stockData: any) => {
    const response = await authFetch("/api/stock/generate-pdf", {
      method: "POST",
      body: JSON.stringify({ stockData }),
      headers: { "Content-Type": "application/json" },
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Stock_${format(new Date(), "yyyy-MM-dd")}.pdf`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPdf = async () => {
    try {
      setIsLoading(true);
      const stockData = await fetchStock();
      await downloadPdf(stockData);
    } catch (error) {
      console.error("Error exporting stock to PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportFilteredToPdf = async (filters: ExportStockFilters) => {
    try {
      setIsLoadingFiltered(true);
      const stockData = await fetchStock(filters);
      await downloadPdf(stockData);
    } catch (error) {
      console.error("Error exporting filtered stock to PDF:", error);
    } finally {
      setIsLoadingFiltered(false);
    }
  };

  return {
    exportToPdf,
    exportFilteredToPdf,
    isLoading,
    isLoadingFiltered,
  };
}

export default useExportStock;
