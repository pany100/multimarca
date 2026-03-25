import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useState } from "react";

interface WhatsAppConfirmDialogProps {
  open: boolean;
  orden: any;
  onClose: () => void;
  onConfirm: () => void;
}

export const WhatsAppConfirmDialog = ({
  open,
  orden,
  onClose,
  onConfirm,
}: WhatsAppConfirmDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          maxWidth: "450px",
          width: "100%",
          overflow: "hidden",
        },
      }}
      TransitionProps={{
        style: {
          transitionDuration: "300ms",
        },
      }}
    >
      <Box
        sx={{
          backgroundColor: "success.light",
          py: 0.5,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <WhatsAppIcon sx={{ color: "white" }} />
      </Box>
      <DialogTitle
        id="alert-dialog-title"
        sx={{
          pb: 1,
          pt: 2.5,
          px: 3,
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
          fontWeight: 600,
          color: "text.primary",
          textAlign: "center",
        }}
      >
        Confirmar envío de notificación
      </DialogTitle>
      <DialogContent sx={{ pt: 2, px: 3 }}>
        <DialogContentText
          id="alert-dialog-description"
          sx={{
            color: "text.primary",
            fontSize: "1rem",
            textAlign: "center",
            mb: 2,
          }}
        >
          ¿Está seguro de que desea enviar la notificación por WhatsApp al
          cliente?
        </DialogContentText>

        <Box
          sx={{
            backgroundColor: "background.default",
            p: 2,
            borderRadius: 1,
            mt: 2,
            mb: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.875rem",
              mb: 1,
            }}
          >
            <Box
              component="span"
              sx={{ fontWeight: 600, color: "text.secondary", width: "80px" }}
            >
              Cliente:
            </Box>
            <Box component="span" sx={{ color: "text.primary" }}>
              {orden.auto.owner.fullName}
            </Box>
          </Typography>

          <Typography
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.875rem",
              mb: 1,
            }}
          >
            <Box
              component="span"
              sx={{ fontWeight: 600, color: "text.secondary", width: "80px" }}
            >
              Teléfono:
            </Box>
            <Box component="span" sx={{ color: "text.primary" }}>
              {orden.auto.owner.phone}
            </Box>
          </Typography>

          <Typography
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.875rem",
            }}
          >
            <Box
              component="span"
              sx={{ fontWeight: 600, color: "text.secondary", width: "80px" }}
            >
              Orden:
            </Box>
            <Box component="span" sx={{ color: "text.primary" }}>
              #{orden.id}
            </Box>
          </Typography>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 2,
            fontStyle: "italic",
          }}
        >
          Se enviará un mensaje con los detalles de la reparación y el monto a
          pagar.
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          disabled={loading}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            borderRadius: 1.5,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmClick}
          color="success"
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            borderRadius: 1.5,
          }}
          startIcon={<WhatsAppIcon />}
          autoFocus
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
