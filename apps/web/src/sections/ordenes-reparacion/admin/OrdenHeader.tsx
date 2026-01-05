"use client";

import OrdenClienteInterna from "@/components/orden-reparacion/pdf/OrdenClienteInterna";
import { OrdenMecanicoPdf } from "@/components/orden-reparacion/pdf/OrdenMecanicoPdf";
import { getFormattedDateArg } from "@/utils/fieldHelper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Alert,
  Box,
  Button,
  Chip,
  Link as MuiLink,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PrintMenu } from "./components/PrintMenu";
import { WhatsAppConfirmDialog } from "./components/WhatsAppConfirmDialog";
import { useOrden } from "./contexts/OrdenContext";
import { getEstadoColor, getEstadoLabel } from "./helpers/estadoHelpers";
import { useCerrarOrdenHandler } from "./hooks/useCerrarOrdenHandler";
import { usePrintHandlers } from "./hooks/usePrintHandlers";
import { useWhatsAppHandlers } from "./hooks/useWhatsAppHandlers";

function OrdenHeader() {
  const { orden, setOrden } = useOrden();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // WhatsApp handlers
  const {
    openConfirmModal,
    snackbar,
    setSnackbar,
    handleOpenConfirmModal,
    handleCloseConfirmModal,
    handleSendNotification,
  } = useWhatsAppHandlers(orden.id);

  // Print handlers
  const {
    isMobile,
    mechanicOrderRef,
    internClientOrderRef,
    printMenuAnchor,
    openPrintMenu,
    handleMechanicOrderPrint,
    handleClientOrderPrint,
    handleInternClientOrderPrint,
    handlePdfPrint,
    handleOpenPrintMenu,
    handleClosePrintMenu,
  } = usePrintHandlers(orden.id, (message) => {
    setSnackbar({
      open: true,
      message,
      severity: "error",
    });
  });

  // Cerrar orden handler
  const { loading: cerrandoOrden, handleCerrarOrden: cerrarOrden } =
    useCerrarOrdenHandler(orden.id);

  const handleCerrarOrden = async () => {
    try {
      const ordenActualizada = await cerrarOrden();
      setOrden(ordenActualizada);
      setSnackbar({
        open: true,
        message: "Orden cerrada correctamente",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al cerrar la orden",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Box
        sx={{
          position: isSticky ? "fixed" : "relative",
          top: isSticky ? 64 : "auto",
          left: isSticky ? { xs: 0, sm: 240 } : "auto",
          right: isSticky ? 0 : "auto",
          zIndex: isSticky ? 1000 : "auto",
          backgroundColor: "background.default",
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 1.5,
          pt: isSticky ? 2 : 3,
          mb: isSticky ? 0 : 3,
          px: isSticky ? 3 : 0,
          transition: "all 0.3s ease",
        }}
      >
        {/* Single Row with Title, Status and Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            px: isSticky ? 0 : 2,
          }}
        >
          {/* Left side: Title */}
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              Orden #{orden.id} - Patente {orden.auto?.patent || "N/A"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Creada el {getFormattedDateArg(orden.fechaCreacion)}
            </Typography>
            <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
              <Typography variant="body1" fontWeight="medium">
                Total a pagar:{" "}
                <Typography component="span" fontWeight="bold">
                  $
                  {orden.total?.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </Typography>
              </Typography>
              <Typography variant="body1" fontWeight="medium" color="error">
                Deuda:{" "}
                <Typography component="span" fontWeight="bold" color="error">
                  $
                  {orden.deuda?.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </Typography>
              </Typography>
            </Box>
            <Link href="/dashboard/ordenes-reparacion" passHref legacyBehavior>
              <MuiLink
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: "0.875rem",
                  mt: 0.5,
                  textDecoration: "none",
                  color: "primary.main",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 16 }} />
                Volver a órdenes
              </MuiLink>
            </Link>
          </Box>

          {/* Right side: Status and Action Buttons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={getEstadoLabel(orden.estado)}
              color={getEstadoColor(orden.estado)}
              size="medium"
              sx={{
                fontWeight: 500,
                px: 1,
                "& .MuiChip-label": {
                  px: 1,
                },
              }}
            />

            {/* Close Order Button */}
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={handleCerrarOrden}
              disabled={cerrandoOrden}
              sx={{ textTransform: "none" }}
            >
              {cerrandoOrden ? "Cerrando..." : "Cerrar Orden"}
            </Button>

            <PrintMenu
              isMobile={isMobile}
              printMenuAnchor={printMenuAnchor}
              openPrintMenu={openPrintMenu}
              pdfPath={orden.pdfPath}
              handleOpenPrintMenu={handleOpenPrintMenu}
              handleClosePrintMenu={handleClosePrintMenu}
              handleMechanicOrderPrint={handleMechanicOrderPrint}
              handleInternClientOrderPrint={handleInternClientOrderPrint}
              handleClientOrderPrint={handleClientOrderPrint}
              handlePdfPrint={handlePdfPrint}
            />

            {/* WhatsApp button */}
            {orden.estado !== "Terminado" ? (
              <Tooltip title="Solo disponible para reparaciones terminadas">
                <span>
                  <Button
                    variant="outlined"
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
        </Box>
      </Box>

      <WhatsAppConfirmDialog
        open={openConfirmModal}
        orden={orden}
        onClose={handleCloseConfirmModal}
        onConfirm={handleSendNotification}
      />

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
        {orden !== null && (
          <OrdenMecanicoPdf ref={mechanicOrderRef} repair={orden} />
        )}
        {orden !== null && (
          <OrdenClienteInterna ref={internClientOrderRef} repair={orden} />
        )}
      </div>
    </>
  );
}

export default OrdenHeader;
