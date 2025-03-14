"use client";
import OrdenClienteInterna from "@/components/orden-reparacion/pdf/OrdenClienteInterna";
import OrdenClientePdf from "@/components/orden-reparacion/pdf/OrdenClientePdf";
import { OrdenMecanicoPdf } from "@/components/orden-reparacion/pdf/OrdenMecanicoPdf";
import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  calcularTotalOrdenReparacion,
  getStatusColor,
} from "@/utils/ordenHelper";
import PrintIcon from "@mui/icons-material/Print";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

function Header({ ordenReparacion }: { ordenReparacion: any }) {
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const { authFetch } = useFetch();

  let mechanicOrderRef = useRef(null);
  let clientOrderRef = useRef(null);
  let internClientOrderRef = useRef(null);

  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
  };
  const handleMechanicOrderPrint = useReactToPrint({
    content: () => mechanicOrderRef.current,
  });
  const handleClientOrderPrint = useReactToPrint({
    content: () => clientOrderRef.current,
  });
  const handleInternClientOrderPrint = useReactToPrint({
    content: () => internClientOrderRef.current,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const handleSendNotification = async () => {
    try {
      const response = await authFetch(
        `/api/orden-reparacion/${ordenReparacion.id}/send-notification`,
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
    } finally {
      handleCloseConfirmModal();
    }
  };
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Orden de Reparación #{ordenReparacion.id}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={ordenReparacion.estado}
              color={getStatusColor(ordenReparacion.estado)}
              size="medium"
            />
            <Button
              variant="contained"
              color="info"
              component={Link}
              href={`/dashboard/ordenes-reparacion/${ordenReparacion.id}/editar`}
            >
              Editar orden
            </Button>
          </Box>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="h4">
            {getFormattedPrice(calcularTotalOrdenReparacion(ordenReparacion))}
          </Typography>
        </Box>
      </Box>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handleMechanicOrderPrint}
            fullWidth
          >
            Imprimir orden para el mecánico
          </Button>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            color="warning"
            startIcon={<PrintIcon />}
            onClick={handleInternClientOrderPrint}
            fullWidth
          >
            Imprimir orden interna
          </Button>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PrintIcon />}
            onClick={handleClientOrderPrint}
            fullWidth
          >
            Imprimir orden para el cliente
          </Button>
        </Grid>
        <Grid item xs={12} sm={3}>
          {ordenReparacion.estado !== "Terminado" ? (
            <Tooltip title="Solo disponible para reparaciones terminadas">
              <span>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  fullWidth
                  disabled
                >
                  Enviar orden por WhatsApp al cliente
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={<WhatsAppIcon />}
              onClick={handleSendNotification}
              fullWidth
            >
              Enviar orden por WhatsApp al cliente
            </Button>
          )}
        </Grid>
      </Grid>
      <Dialog
        open={openConfirmModal}
        onClose={handleCloseConfirmModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"¿Confirmar envío de notificación?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea enviar la notificación por WhatsApp al
            cliente?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSendNotification} color="primary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <div style={{ display: "none" }}>
        {ordenReparacion !== null && (
          <OrdenMecanicoPdf ref={mechanicOrderRef} repair={ordenReparacion} />
        )}
        {ordenReparacion !== null && (
          <OrdenClientePdf ref={clientOrderRef} repair={ordenReparacion} />
        )}
        {ordenReparacion !== null && (
          <OrdenClienteInterna
            ref={internClientOrderRef}
            repair={ordenReparacion}
          />
        )}
      </div>
    </>
  );
}

export default Header;
