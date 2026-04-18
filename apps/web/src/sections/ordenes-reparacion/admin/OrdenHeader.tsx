"use client";

import ConfirmPrintModal from "@/components/ConfirmPrintModal";
import OrdenClienteInterna from "@/components/orden-reparacion/pdf/OrdenClienteInterna";
import { OrdenMecanicoPdf } from "@/components/orden-reparacion/pdf/OrdenMecanicoPdf";
import authFetch from "@/utils/authFetch";
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

const ESTADO_TERMINADO = "Terminado";

function OrdenHeader() {
  const { orden, setOrden } = useOrden();
  const [isSticky, setIsSticky] = useState(false);
  const [openConfirmPrintModal, setOpenConfirmPrintModal] = useState(false);
  const [encabezadoPdf, setEncabezadoPdf] = useState<string | undefined>();

  useEffect(() => {
    authFetch("/api/configuracion-general?query=Encabezado+PDF&size=1")
      .then((res) => res.json())
      .then((data) => {
        const item = data.items?.[0];
        if (item) setEncabezadoPdf(item.valor);
      })
      .catch(() => {});
  }, []);

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

  const handleClientOrderPrintClick = () => {
    handleClosePrintMenu();
    if (orden.estado === ESTADO_TERMINADO) {
      setOpenConfirmPrintModal(true);
    } else {
      handleClientOrderPrint();
    }
  };

  const handleConfirmPrintInforme = () => {
    setOpenConfirmPrintModal(false);
    handleClientOrderPrint();
  };

  return (
    <>
      {/* Spacer cuando el header es sticky */}
      {isSticky && <Box sx={{ height: isSticky ? 80 : 0 }} />}

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
          py: isSticky ? 1 : 2,
          mb: isSticky ? 0 : 3,
          px: isSticky ? 3 : 0,
          transition: "all 0.2s ease",
        }}
      >
        {/* Single Row with Title, Status and Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: isSticky ? 1 : 2,
            px: isSticky ? 0 : 2,
          }}
        >
          {/* Left side: Title */}
          <Box
            sx={{
              display: "flex",
              alignItems: isSticky ? "center" : "flex-start",
              gap: isSticky ? 2 : 0,
              flexDirection: isSticky ? "row" : "column",
            }}
          >
            <Typography
              variant={isSticky ? "h6" : "h4"}
              component="h1"
              sx={{
                fontWeight: 600,
                fontSize: isSticky ? "1rem" : { xs: "1.5rem", md: "2rem" },
                whiteSpace: isSticky ? "nowrap" : "normal",
              }}
            >
              Orden #{orden.id} - {orden.auto?.patent || "N/A"}
            </Typography>

            {/* Info adicional - solo visible cuando NO es sticky */}
            {!isSticky && (
              <>
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
                    <Typography
                      component="span"
                      fontWeight="bold"
                      color="error"
                    >
                      $
                      {orden.deuda?.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || "0.00"}
                    </Typography>
                  </Typography>
                </Box>
                <Link
                  href="/dashboard/ordenes-reparacion"
                  passHref
                  legacyBehavior
                >
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
              </>
            )}

            {/* Info compacta - solo visible cuando ES sticky */}
            {isSticky && (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{ display: "flex", gap: 0.5 }}
                >
                  Total:{" "}
                  <Typography
                    component="span"
                    fontWeight="bold"
                    variant="body2"
                  >
                    $
                    {orden.total?.toLocaleString("es-AR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }) || "0"}
                  </Typography>
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  color="error"
                  sx={{ display: "flex", gap: 0.5 }}
                >
                  Deuda:{" "}
                  <Typography
                    component="span"
                    fontWeight="bold"
                    color="error"
                    variant="body2"
                  >
                    $
                    {orden.deuda?.toLocaleString("es-AR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }) || "0"}
                  </Typography>
                </Typography>
              </Box>
            )}
          </Box>

          {/* Right side: Status and Action Buttons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isSticky ? 0.5 : 1,
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={getEstadoLabel(orden.estado)}
              color={getEstadoColor(orden.estado)}
              size={isSticky ? "small" : "medium"}
              sx={{
                fontWeight: 500,
                px: isSticky ? 0.5 : 1,
                "& .MuiChip-label": {
                  px: isSticky ? 0.5 : 1,
                },
              }}
            />

            {/* Close Order Button */}
            <Button
              variant="outlined"
              size={isSticky ? "small" : "medium"}
              startIcon={!isSticky && <CloseIcon />}
              onClick={handleCerrarOrden}
              disabled={cerrandoOrden}
              sx={{
                textTransform: "none",
                minWidth: isSticky ? "auto" : undefined,
              }}
            >
              {cerrandoOrden ? (
                "..."
              ) : isSticky ? (
                <CloseIcon fontSize="small" />
              ) : (
                "Cerrar Orden"
              )}
            </Button>

            <PrintMenu
              isMobile={isMobile}
              isSticky={isSticky}
              printMenuAnchor={printMenuAnchor}
              openPrintMenu={openPrintMenu}
              pdfPath={orden.pdfPath}
              handleOpenPrintMenu={handleOpenPrintMenu}
              handleClosePrintMenu={handleClosePrintMenu}
              handleMechanicOrderPrint={handleMechanicOrderPrint}
              handleInternClientOrderPrint={handleInternClientOrderPrint}
              handleClientOrderPrint={handleClientOrderPrintClick}
              handlePdfPrint={handlePdfPrint}
            />

            {/* WhatsApp button */}
            {orden.estado !== "Terminado" ? (
              <Tooltip title="Solo disponible para reparaciones terminadas">
                <span>
                  <Button
                    variant="outlined"
                    size={isSticky ? "small" : "medium"}
                    startIcon={!isSticky && <WhatsAppIcon />}
                    disabled
                    sx={{
                      textTransform: "none",
                      minWidth: isSticky ? "auto" : undefined,
                    }}
                  >
                    {isSticky ? (
                      <WhatsAppIcon fontSize="small" />
                    ) : (
                      "Enviar por WhatsApp"
                    )}
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                variant="outlined"
                color="success"
                size={isSticky ? "small" : "medium"}
                startIcon={!isSticky && <WhatsAppIcon />}
                onClick={handleOpenConfirmModal}
                sx={{
                  textTransform: "none",
                  minWidth: isSticky ? "auto" : undefined,
                }}
              >
                {isSticky ? (
                  <WhatsAppIcon fontSize="small" />
                ) : (
                  "Enviar por WhatsApp"
                )}
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

      <ConfirmPrintModal
        open={openConfirmPrintModal}
        onClose={() => setOpenConfirmPrintModal(false)}
        onConfirm={handleConfirmPrintInforme}
        message="La orden está terminada. ¿Revisó que toda la información del informe final sea correcta antes de proceder con el envío?"
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
          <OrdenMecanicoPdf ref={mechanicOrderRef} repair={orden} encabezadoPdf={encabezadoPdf} />
        )}
        {orden !== null && (
          <OrdenClienteInterna ref={internClientOrderRef} repair={orden} encabezadoPdf={encabezadoPdf} />
        )}
      </div>
    </>
  );
}

export default OrdenHeader;
