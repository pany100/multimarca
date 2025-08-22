import { useFetch } from "@/contexts/FetchContext";
import { format } from "date-fns";
import { useState } from "react";

function useExportStock() {
  const [isLoading, setIsLoading] = useState(false);
  const { authFetch } = useFetch();

  const fetchAllStock = async () => {
    const response = await authFetch("/api/stock/export-all");
    return response.json();
  };

  const exportToPdf = async () => {
    try {
      setIsLoading(true);

      const stockData = await fetchAllStock();

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
    } catch (error) {
      console.error("Error exporting stock to PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exportToPdf,
    isLoading,
  };
}

export default useExportStock;
