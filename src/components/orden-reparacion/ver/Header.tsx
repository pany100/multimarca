import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  calcularTotalOrdenReparacion,
  getStatusColor,
} from "@/utils/ordenHelper";
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
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

// PDF components
import OrdenClienteInterna from "@/components/orden-reparacion/pdf/OrdenClienteInterna";
import OrdenClientePdf from "@/components/orden-reparacion/pdf/OrdenClientePdf";
import { OrdenMecanicoPdf } from "@/components/orden-reparacion/pdf/OrdenMecanicoPdf";
import { useGeneratePdf } from "@/hooks/orden-reparacion/useGeneratePdf";

function Header({ ordenReparacion }: { ordenReparacion: any }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { authFetch } = useFetch();

  // Refs for printing
  const mechanicOrderRef = useRef(null);
  const clientOrderRef = useRef(null);
  const internClientOrderRef = useRef(null);

  // State for notification dialog and snackbar
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
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

  // State for print menu
  const [printMenuAnchor, setPrintMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const openPrintMenu = Boolean(printMenuAnchor);

  // Print handlers
  const handleMechanicOrderPrint = useReactToPrint({
    content: () => mechanicOrderRef.current,
  });

  const handleClientOrderPrint2 = useReactToPrint({
    content: () => clientOrderRef.current,
  });
  const handleClientOrderPrint = async () => {
    await generatePdf(
      `/api/orden-reparacion/${ordenReparacion.id}/pdf-completo`
    );
  };

  const handleInternClientOrderPrint = useReactToPrint({
    content: () => internClientOrderRef.current,
  });

  // Handle PDF print directly using the URL
  const handlePdfPrint = () => {
    if (ordenReparacion.pdfPath) {
      // Open the PDF in the same window
      window.open(ordenReparacion.pdfPath, "_blank");
    }
  };

  // Menu handlers
  const handleOpenPrintMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPrintMenuAnchor(event.currentTarget);
  };

  const handleClosePrintMenu = () => {
    setPrintMenuAnchor(null);
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
      setSnackbar({
        open: true,
        message: "Error al enviar la notificación",
        severity: "error",
      });
    } finally {
      handleCloseConfirmModal();
    }
  };

  return (
    <>
      {/* Main header container */}
      <Grid container spacing={2}>
        {/* Order title and status */}
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
                Orden #{ordenReparacion.id}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                mb: 2,
              }}
            >
              <Chip
                label={ordenReparacion.estado}
                color={getStatusColor(ordenReparacion.estado)}
                size="medium"
                sx={{
                  fontWeight: 500,
                  px: 1,
                  "& .MuiChip-label": {
                    px: 1,
                  },
                }}
              />
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
              {getFormattedPrice(calcularTotalOrdenReparacion(ordenReparacion))}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              component={Link}
              href={`/dashboard/ordenes-reparacion/${ordenReparacion.id}/editar`}
              startIcon={<EditIcon />}
              size={isMobile ? "small" : "medium"}
              sx={{
                mt: { md: 2 },
                order: { xs: 0, md: 1 },
                textTransform: "none",
              }}
            >
              Editar orden
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
            {/* Print dropdown for desktop */}
            {!isMobile ? (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PrintIcon />}
                  onClick={handleOpenPrintMenu}
                  aria-label="Opciones de impresión"
                  aria-controls={openPrintMenu ? "print-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={openPrintMenu ? "true" : undefined}
                  sx={{ textTransform: "none" }}
                >
                  Imprimir
                </Button>
                <Menu
                  id="print-menu"
                  anchorEl={printMenuAnchor}
                  open={openPrintMenu}
                  onClose={handleClosePrintMenu}
                  MenuListProps={{
                    "aria-labelledby": "print-button",
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMechanicOrderPrint();
                      handleClosePrintMenu();
                    }}
                  >
                    <ListItemIcon>
                      <PrintIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText>Para mecánico</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleInternClientOrderPrint();
                      handleClosePrintMenu();
                    }}
                  >
                    <ListItemIcon>
                      <PrintIcon fontSize="small" color="warning" />
                    </ListItemIcon>
                    <ListItemText>Orden interna</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleClientOrderPrint();
                      handleClosePrintMenu();
                    }}
                  >
                    <ListItemIcon>
                      <PrintIcon fontSize="small" color="secondary" />
                    </ListItemIcon>
                    <ListItemText>Para cliente</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      if (ordenReparacion.pdfPath) {
                        handlePdfPrint();
                      }
                      handleClosePrintMenu();
                    }}
                    disabled={!ordenReparacion.pdfPath}
                  >
                    <ListItemIcon>
                      <PrintIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText>Salida del scanner</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              // Mobile print buttons
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="Imprimir para mecánico">
                  <IconButton
                    color="primary"
                    onClick={handleMechanicOrderPrint}
                    aria-label="Imprimir para mecánico"
                  >
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Imprimir orden interna">
                  <IconButton
                    color="warning"
                    onClick={handleInternClientOrderPrint}
                    aria-label="Imprimir orden interna"
                  >
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Imprimir para cliente">
                  <IconButton
                    color="secondary"
                    onClick={handleClientOrderPrint}
                    aria-label="Imprimir para cliente"
                  >
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Imprimir salida de scanner">
                  <span>
                    <IconButton
                      color="default"
                      onClick={handlePdfPrint}
                      aria-label="Imprimir salida de scanner"
                      disabled={!ordenReparacion.pdfPath}
                    >
                      <PrintIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            )}

            {/* WhatsApp button */}
            {ordenReparacion.estado !== "Terminado" ? (
              <Tooltip title="Solo disponible para reparaciones terminadas">
                <span>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    disabled
                    sx={{ textTransform: "none" }}
                  >
                    Enviar por WhatsApp
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                variant="outlined"
                color="success"
                startIcon={<WhatsAppIcon />}
                onClick={handleOpenConfirmModal}
                sx={{ textTransform: "none" }}
              >
                Enviar por WhatsApp
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* WhatsApp confirmation dialog */}
      <Dialog
        open={openConfirmModal}
        onClose={handleCloseConfirmModal}
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
                {ordenReparacion.auto.owner.fullName}
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
                {ordenReparacion.auto.owner.phone}
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
                #{ordenReparacion.id}
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
            onClick={handleCloseConfirmModal}
            color="inherit"
            variant="outlined"
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
            onClick={handleSendNotification}
            color="success"
            variant="contained"
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

      {/* Notification snackbar */}
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

      {/* Hidden PDF components for printing */}
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
