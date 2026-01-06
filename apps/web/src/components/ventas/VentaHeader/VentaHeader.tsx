"use client";

import { useVenta } from "@/sections/ventas/admin/contexts/VentaContext";
import { useVentaHandlers } from "@/sections/ventas/hooks/useVentaHandlers";
import { Box } from "@mui/material";
import { VentaActions } from "./VentaActions";
import { VentaInfo } from "./VentaInfo";
import { VentaSnackbar } from "./VentaSnackbar";
import { useVentaSticky } from "./useVentaSticky";

function VentaHeader({ venta: ventaProp }: { venta?: any }) {
  // Intentar obtener del contexto, si no está disponible usar la prop
  const context = useVenta();
  const venta = ventaProp || context?.venta;

  const isSticky = useVentaSticky();

  const { handlePrint, printLoading, snackbar, closeSnackbar } =
    useVentaHandlers({
      venta,
    });

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
            onPrint={handlePrint}
          />
        </Box>
      </Box>

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
