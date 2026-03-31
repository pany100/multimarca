import { useState } from "react";
import { useFetch } from "@/contexts/FetchContext";
import { resolveWhatsAppErrorMessage } from "@/utils/whatsapp-error-messages";

export const useWhatsAppVentaHandlers = (ventaId: number) => {
  const { authFetch } = useFetch();
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleEnviarPorWhatsApp = async () => {
    setEnviandoWhatsApp(true);
    try {
      const res = await authFetch("/api/whatsapp/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceType: "venta", resourceId: ventaId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al enviar por WhatsApp");
      }
      setSnackbar({
        open: true,
        message: "PDF enviado por WhatsApp correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: resolveWhatsAppErrorMessage(error?.message),
        severity: "error",
      });
    } finally {
      setEnviandoWhatsApp(false);
    }
  };

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));
  return { enviandoWhatsApp, handleEnviarPorWhatsApp, snackbar, closeSnackbar };
};

