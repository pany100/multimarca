"use client";

import ConfirmPrintModal from "@/components/ConfirmPrintModal";
import { useVenta } from "@/sections/ventas/admin/contexts/VentaContext";
import { useVentaHandlers } from "@/sections/ventas/hooks/useVentaHandlers";
import { useWhatsAppVentaHandlers } from "@/sections/ventas/hooks/useWhatsAppVentaHandlers";
import PrintIcon from "@mui/icons-material/Print";
import {
  Alert,
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
} from "@mui/material";
import { useState } from "react";
import { VentaActions } from "./VentaActions";
import { VentaInfo } from "./VentaInfo";
import { VentaSnackbar } from "./VentaSnackbar";
import { useVentaSticky } from "./useVentaSticky";

function VentaHeader({ venta: ventaProp }: { venta?: any }) {
  // Intentar obtener del contexto, si no está disponible usar la prop
  const context = useVenta();
  const venta = ventaProp || context?.venta;

  const isSticky = useVentaSticky();
  const [openConfirmPrint, setOpenConfirmPrint] = useState(false);
  const [printMenuAnchor, setPrintMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const openPrintMenu = Boolean(printMenuAnchor);
  const [pendingPrintType, setPendingPrintType] = useState<
    "factura" | "remito-original" | "remito-duplicado" | null
  >(null);

  const { handlePrint, handlePrintRemito, printLoading, snackbar, closeSnackbar } =
    useVentaHandlers({
      venta,
    });

  const { enviandoWhatsApp, handleEnviarPorWhatsApp, snackbar: waSnackbar, closeSnackbar: closeWaSnackbar } =
    useWhatsAppVentaHandlers(venta.id);

  const debeConfirmarImpresion = [
    "Cerrado",
    "Presupuestado",
    "Entregado",
  ].includes(venta?.estado);

  const handleOpenPrintMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPrintMenuAnchor(event.currentTarget);
  };

  const handleClosePrintMenu = () => {
    setPrintMenuAnchor(null);
  };

  const requestPrint = (type: "factura" | "remito-original" | "remito-duplicado") => {
    setPendingPrintType(type);
    handleClosePrintMenu();
    if (type === "factura" && debeConfirmarImpresion) {
      setOpenConfirmPrint(true);
      return;
    }
    if (type === "factura") {
      handlePrint();
    } else {
      handlePrintRemito(type === "remito-original" ? "original" : "duplicado");
    }
  };

  const handleConfirmPrint = () => {
    setOpenConfirmPrint(false);
    if (pendingPrintType === "remito-original" || pendingPrintType === "remito-duplicado") {
      handlePrintRemito(pendingPrintType === "remito-original" ? "original" : "duplicado");
      setPendingPrintType(null);
      return;
    }
    handlePrint();
    setPendingPrintType(null);
  };

  return (
    <>
      {/* Spacer cuando el header es sticky */}
      {isSticky && <Box sx={{ height: 80 }} />}

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
          <VentaInfo venta={venta} isSticky={isSticky} />

          <VentaActions
            venta={venta}
            printLoading={printLoading}
            enviandoWhatsApp={enviandoWhatsApp}
            isSticky={isSticky}
            onPrint={handleOpenPrintMenu}
            onEnviarWhatsApp={handleEnviarPorWhatsApp}
          />
        </Box>
      </Box>

      <Menu
        anchorEl={printMenuAnchor}
        open={openPrintMenu}
        onClose={handleClosePrintMenu}
      >
        <MenuItem onClick={() => requestPrint("factura")}>
          <ListItemIcon>
            <PrintIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Imprimir Factura</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => requestPrint("remito-original")}>
          <ListItemIcon>
            <PrintIcon fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText>Remito para Cliente (Original)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => requestPrint("remito-duplicado")}>
          <ListItemIcon>
            <PrintIcon fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText>Remito para Taller (Duplicado)</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmPrintModal
        open={openConfirmPrint}
        onClose={() => setOpenConfirmPrint(false)}
        onConfirm={handleConfirmPrint}
        message="¿Revisó que toda la información de la venta sea correcta antes de proceder con el envío?"
      />

      <VentaSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />

      <Snackbar
        open={waSnackbar.open}
        autoHideDuration={6000}
        onClose={closeWaSnackbar}
      >
        <Alert
          onClose={closeWaSnackbar}
          severity={waSnackbar.severity}
          sx={{ width: "100%" }}
        >
          {waSnackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default VentaHeader;
