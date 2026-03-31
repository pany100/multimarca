import { useFetch } from "@/contexts/FetchContext";
import { resolveWhatsAppErrorMessage } from "@/utils/whatsapp-error-messages";
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

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setSnackbar({
          open: true,
          message: resolveWhatsAppErrorMessage(errData.error),
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "PDF enviado por WhatsApp correctamente.",
          severity: "success",
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: resolveWhatsAppErrorMessage(error?.message),
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
