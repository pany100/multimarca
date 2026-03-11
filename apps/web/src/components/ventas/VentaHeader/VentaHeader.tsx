"use client";

import ConfirmPrintModal from "@/components/ConfirmPrintModal";
import { useVenta } from "@/sections/ventas/admin/contexts/VentaContext";
import { useVentaHandlers } from "@/sections/ventas/hooks/useVentaHandlers";
import { Box } from "@mui/material";
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

  const { handlePrint, printLoading, snackbar, closeSnackbar } =
    useVentaHandlers({
      venta,
    });

  const debeConfirmarImpresion = [
    "Cerrado",
    "Presupuestado",
    "Entregado",
  ].includes(venta?.estado);

  const handlePrintClick = () => {
    if (debeConfirmarImpresion) {
      setOpenConfirmPrint(true);
    } else {
      handlePrint();
    }
  };

  const handleConfirmPrint = () => {
    setOpenConfirmPrint(false);
    handlePrint();
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
            isSticky={isSticky}
            onPrint={handlePrintClick}
          />
        </Box>
      </Box>

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
    </>
  );
}

export default VentaHeader;
