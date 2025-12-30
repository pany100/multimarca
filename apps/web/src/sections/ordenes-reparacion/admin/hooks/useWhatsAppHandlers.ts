import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

export const useWhatsAppHandlers = (ordenId: number) => {
  const { authFetch } = useFetch();
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleOpenConfirmModal = () => {
    setOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
  };

  const handleSendNotification = async () => {
    try {
      const response = await authFetch(
        `/api/orden-reparacion/${ordenId}/send-notification`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Notificación enviada con éxito",
          severity: "success",
        });
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Error al enviar la notificación",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({
        open: true,
        message: "Error al enviar la notificación",
        severity: "error",
      });
    } finally {
      handleCloseConfirmModal();
    }
  };

  return {
    openConfirmModal,
    snackbar,
    setSnackbar,
    handleOpenConfirmModal,
    handleCloseConfirmModal,
    handleSendNotification,
  };
};
