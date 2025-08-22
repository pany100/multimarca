import useRecibo from "@/hooks/useRecibo";
import { Box, Button, Modal, Typography } from "@mui/material";

function RecibosModal({
  modalOpen,
  setModalOpen,
  pdfUrl,
  selectedIngreso,
  setSnackbar,
}: {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  pdfUrl: string;
  selectedIngreso: { id: string } | null;
  setSnackbar: (snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error";
  }) => void;
}) {
  const { sendRecibo } = useRecibo();
  const handleSendRecibo = async () => {
    if (!selectedIngreso) return;
    try {
      const response = await sendRecibo(selectedIngreso);

      if (response) {
        setSnackbar({
          open: true,
          message: "Recibo enviado con éxito",
          severity: "success",
        });
      } else {
        throw new Error("Error al enviar el recibo");
      }
    } catch (error) {
      console.error("Error al enviar el recibo:", error);
      setSnackbar({
        open: true,
        message: "Error al enviar el recibo",
        severity: "error",
      });
    } finally {
      setModalOpen(false);
    }
  };
  return (
    <Modal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%", // Aumenta el ancho del modal
          maxWidth: 900, // Establece un ancho máximo
          height: "90%", // Aumenta la altura del modal
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Vista previa del recibo
        </Typography>
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          style={{ flexGrow: 1 }}
        />
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSendRecibo} variant="contained">
            Enviar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default RecibosModal;
