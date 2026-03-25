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
      const response = await authFetch("/api/whatsapp/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceType: "orden", resourceId: ordenId }),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "PDF enviado por WhatsApp correctamente",
          severity: "success",
        });
      } else {
        const err = await response.json();
        setSnackbar({
          open: true,
          message: err.error || "Error al enviar por WhatsApp",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al enviar por WhatsApp",
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
