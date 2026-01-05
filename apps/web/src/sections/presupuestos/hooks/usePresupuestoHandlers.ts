import { useGeneratePdf } from "@/hooks/orden-reparacion/useGeneratePdf";
import { useState } from "react";
import { useUpdatePresupuesto } from "./useUpdatePresupuesto";

interface UsePresupuestoHandlersProps {
  presupuesto: any;
  onPresupuestoUpdate?: (presupuesto: any) => void;
}

export const usePresupuestoHandlers = ({
  presupuesto,
  onPresupuestoUpdate,
}: UsePresupuestoHandlersProps) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

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

  // WhatsApp link
  const getWhatsAppLink = () => {
    const phone =
      presupuesto.auto?.owner?.phone || presupuesto.informacionCliente;
    if (!phone) return "";

    const total = presupuesto.totalAPagar || presupuesto.total;
    const vehicleInfo = presupuesto.auto
      ? `${presupuesto.auto.brand} ${presupuesto.auto.model} (${presupuesto.auto.patent})`
      : presupuesto.informacionAuto || "su vehículo";

    const clientName = presupuesto.auto?.owner?.fullName || "Estimado cliente";

    const message = `Hola ${clientName}, le enviamos el presupuesto para ${vehicleInfo}. El total es de $${
      total?.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) || "0.00"
    }.`;

    return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
      message
    )}`;
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return {
    handleEnviarPresupuesto,
    handlePrint,
    getWhatsAppLink,
    enviandoPresupuesto,
    snackbar,
    closeSnackbar,
  };
};
