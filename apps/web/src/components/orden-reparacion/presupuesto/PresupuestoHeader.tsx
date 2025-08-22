import { useFetch } from "@/contexts/FetchContext";
import { useGeneratePdf } from "@/hooks/orden-reparacion/useGeneratePdf";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
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
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useRef, useState } from "react";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

// Helper function to map estado to a readable string
const mapEstadoPresupuesto = (estado: string) => {
  switch (estado) {
    case "EnPreparacion":
      return "En Preparación";
    case "Terminado":
      return "Terminado";
    case "Enviado":
      return "Enviado";
    case "ADefinir":
      return "A Definir";
    case "Aceptado":
      return "Aceptado";
    case "Rechazado":
      return "Rechazado";
    case "Descartado":
      return "Descartado";
    default:
      return "Estado Desconocido";
  }
};

// Helper function to map estado to a color
const mapEstadoColor = (estado: string) => {
  switch (estado) {
    case "EnPreparacion":
      return "#FFA500"; // Orange
    case "Terminado":
      return "#FFD700"; // Amarillo fuerte
    case "Enviado":
      return "#3498db"; // Blue
    case "Aceptado":
      return "#2ecc71"; // Green
    case "Rechazado":
      return "#e74c3c"; // Red
    case "Descartado":
      return "#9b59b6"; // Purple light
    default:
      return "#95a5a6"; // Gray
  }
};

function PresupuestoHeader({ presupuesto }: { presupuesto: any }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { authFetch } = useFetch();
  const { generatePdf } = useGeneratePdf({
    onError: () => {
      setSnackbar({
        open: true,
        message: "Error al generar el PDF del cliente",
        severity: "error",
      });
    },
    printDirectly: true,
  });
  // Ref for printing
  const clientePresupuestoRef = useRef(null);

  // State for notification dialog and snackbar
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Print handlers
  const handleClientePresupuestoPrint = async () => {
    await generatePdf(`/api/presupuestos/${presupuesto.id}/pdf-completo`);
  };
  // Notification handlers
  const handleOpenConfirmModal = () => {
    setOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
  };

  const handleSendNotification = async () => {
    try {
      const response = await authFetch(
        `/api/presupuestos/${presupuesto.id}/send-notification`,
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

  // WhatsApp share
  const createWhatsAppLink = () => {
    if (!presupuesto.auto?.owner?.phone) return "";

    const total = calcularTotalOrdenReparacion(presupuesto);
    const message = `Hola ${
      presupuesto.auto.owner.fullName
    }, le enviamos el presupuesto para su vehículo ${presupuesto.auto.brand} ${
      presupuesto.auto.model
    } (${presupuesto.auto.patent}). El total es de ${getFormattedPrice(
      total
    )}.`;

    return `https://wa.me/${presupuesto.auto.owner.phone.replace(
      /\D/g,
      ""
    )}?text=${encodeURIComponent(message)}`;
  };

  return (
    <>
      {/* Main header container */}
      <Grid container spacing={2}>
        {/* Presupuesto title and status */}
        <Grid item xs={12} md={7}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                Presupuesto #{presupuesto.id}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                mb: 2,
              }}
            >
              <Chip
                label={mapEstadoPresupuesto(presupuesto.estado)}
                sx={{
                  backgroundColor: mapEstadoColor(presupuesto.estado),
                  color: "white",
                  fontWeight: 500,
                  px: 1,
                  "& .MuiChip-label": {
                    px: 1,
                  },
                }}
              />

              <Typography variant="body2" color="text.secondary">
                Fecha:{" "}
                {format(new Date(presupuesto.fecha), "PPP", { locale: es })}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.8rem", md: "1.5rem" },
                }}
              >
                Administrativos:
              </Typography>
              {presupuesto.tareasAdministrativas.map((tarea: any) => (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  key={tarea.id}
                >
                  {tarea.usuario.fullName} - {tarea.descripcion}
                </Typography>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Price and edit button */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              justifyContent: { xs: "space-between", md: "flex-end" },
              alignItems: { xs: "center", md: "flex-end" },
              height: "100%",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: "primary.main",
                fontSize: { xs: "1.5rem", md: "2rem" },
                order: { xs: 1, md: 0 },
              }}
            >
              {getFormattedPrice(calcularTotalOrdenReparacion(presupuesto))}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              component={Link}
              href={`/dashboard/presupuestos/${presupuesto.id}/editar`}
              startIcon={<EditIcon />}
              size={isMobile ? "small" : "medium"}
              sx={{
                mt: { md: 2 },
                order: { xs: 0, md: 1 },
                textTransform: "none",
              }}
            >
              Editar presupuesto
            </Button>
          </Box>
        </Grid>

        {/* Action buttons */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mt: 1,
            }}
          >
            {/* Print button */}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handleClientePresupuestoPrint}
              sx={{ textTransform: "none" }}
            >
              Imprimir presupuesto para cliente
            </Button>

            {/* WhatsApp button */}
            {presupuesto.auto?.owner?.phone && (
              <Button
                variant="outlined"
                color="success"
                startIcon={<WhatsAppIcon />}
                component="a"
                href={createWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: "none" }}
              >
                Enviar por WhatsApp
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Notification dialog */}
      <Dialog
        open={openConfirmModal}
        onClose={handleCloseConfirmModal}
        aria-labelledby="notification-dialog-title"
        aria-describedby="notification-dialog-description"
      >
        <DialogTitle id="notification-dialog-title">
          Enviar notificación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="notification-dialog-description">
            ¿Está seguro que desea enviar una notificación al cliente sobre este
            presupuesto?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSendNotification} color="primary" autoFocus>
            Enviar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default PresupuestoHeader;
