import { useState } from "react";

export const useWhatsAppVentaHandlers = (ventaId: number) => {
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleEnviarPorWhatsApp = async () => {
    setEnviandoWhatsApp(true);
    try {
      const res = await fetch("/api/whatsapp/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
        message: error.message || "Error al enviar por WhatsApp",
        severity: "error",
      });
    } finally {
      setEnviandoWhatsApp(false);
    }
  };

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));
  return { enviandoWhatsApp, handleEnviarPorWhatsApp, snackbar, closeSnackbar };
};

