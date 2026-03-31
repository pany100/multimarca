import { useGeneratePdf } from "@/hooks/orden-reparacion/useGeneratePdf";
import { useState } from "react";
import { useUpdatePresupuesto } from "./useUpdatePresupuesto";
import { useFetch } from "@/contexts/FetchContext";
import { resolveWhatsAppErrorMessage } from "@/utils/whatsapp-error-messages";

interface UsePresupuestoHandlersProps {
  presupuesto: any;
  onPresupuestoUpdate?: (presupuesto: any) => void;
}

export const usePresupuestoHandlers = ({
  presupuesto,
  onPresupuestoUpdate,
}: UsePresupuestoHandlersProps) => {
  const { authFetch } = useFetch();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);

  const { updatePresupuesto, loading: enviandoPresupuesto } =
    useUpdatePresupuesto(presupuesto.id);

  const { generatePdf } = useGeneratePdf({
    onError: () => {
      setSnackbar({
        open: true,
        message: "Error al generar el PDF",
        severity: "error",
      });
    },
    printDirectly: true,
  });

  // Enviar presupuesto
  const handleEnviarPresupuesto = async () => {
    try {
      const presupuestoActualizado = await updatePresupuesto({
        estado: "Enviado",
        fechaEnvio: new Date().toISOString(),
      });

      if (onPresupuestoUpdate) {
        onPresupuestoUpdate(presupuestoActualizado);
      }

      setSnackbar({
        open: true,
        message: "Presupuesto enviado correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al enviar el presupuesto",
        severity: "error",
      });
    }
  };

  // Imprimir presupuesto
  const handlePrint = async () => {
    await generatePdf(`/api/presupuestos/${presupuesto.id}/pdf-completo`);
  };

  const handleEnviarPorWhatsApp = async () => {
    setEnviandoWhatsApp(true);
    try {
      const res = await authFetch("/api/whatsapp/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceType: "presupuesto",
          resourceId: presupuesto.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al enviar por WhatsApp");
      }

      const presupuestoActualizado = await updatePresupuesto({
        estado: "Enviado",
        fechaEnvio: new Date().toISOString(),
      });
      if (onPresupuestoUpdate) onPresupuestoUpdate(presupuestoActualizado);

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

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return {
    handleEnviarPresupuesto,
    handlePrint,
    handleEnviarPorWhatsApp,
    enviandoPresupuesto,
    enviandoWhatsApp,
    snackbar,
    closeSnackbar,
  };
};
