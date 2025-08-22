import { useFetch } from "@/contexts/FetchContext";
import { format } from "date-fns";
import { useState } from "react";

function useExportarTurnos() {
  const [isLoading, setIsLoading] = useState(false);
  const { authFetch } = useFetch();

  const exportarSemana = async (nextWeek: boolean = false) => {
    try {
      setIsLoading(true);

      // Send the week parameter to the endpoint
      const response = await authFetch("/api/turnos/export-week", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nextWeek }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Turnos_${format(new Date(), "yyyy-MM-dd")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exportando turnos a PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exportarSemana,
    isLoading,
  };
}

export default useExportarTurnos;
