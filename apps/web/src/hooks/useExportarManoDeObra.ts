import { useFetch } from "@/contexts/FetchContext";
import { format } from "date-fns";
import { useState } from "react";

function useExportarManoDeObra() {
  const [isLoading, setIsLoading] = useState(false);
  const { authFetch } = useFetch();

  const fetchAllTrabajos = async () => {
    const response = await authFetch("/api/mano-de-obra/export-all");
    return response.json();
  };

  const exportToPdf = async () => {
    try {
      setIsLoading(true);

      const trabajosData = await fetchAllTrabajos();

      const response = await authFetch("/api/mano-de-obra/generate-pdf", {
        method: "POST",
        body: JSON.stringify({ trabajosData }),
        headers: { "Content-Type": "application/json" },
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `ManoDeObra_${format(new Date(), "yyyy-MM-dd")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting mano de obra to PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exportToPdf,
    isLoading,
  };
}

export default useExportarManoDeObra;
