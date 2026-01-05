import { useGeneratePdf } from "@/hooks/orden-reparacion/useGeneratePdf";
import { useState } from "react";

interface UseVentaHandlersProps {
  venta: any;
}

export const useVentaHandlers = ({ venta }: UseVentaHandlersProps) => {
  const [printLoading, setPrintLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const { generatePdf } = useGeneratePdf({
    onError: () => {
      setSnackbar({
        open: true,
        message: "Error al generar el PDF de la venta",
        severity: "error",
      });
      setPrintLoading(false);
    },
    printDirectly: true,
  });

  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      await generatePdf(`/api/ventas/${venta.id}/pdf-completo`);
    } finally {
      setPrintLoading(false);
    }
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return {
    handlePrint,
    printLoading,
    snackbar,
    closeSnackbar,
  };
};
