"use client";

import { usePresupuesto } from "@/sections/presupuestos/admin/contexts/PresupuestoContext";
import { usePresupuestoHandlers } from "@/sections/presupuestos/hooks/usePresupuestoHandlers";
import { Box } from "@mui/material";
import { PresupuestoActions } from "./PresupuestoActions";
import { PresupuestoInfo } from "./PresupuestoInfo";
import { PresupuestoSnackbar } from "./PresupuestoSnackbar";
import { usePresupuestoSticky } from "./usePresupuestoSticky";

function PresupuestoHeader({
  presupuesto: presupuestoProp,
}: {
  presupuesto?: any;
}) {
  // Intentar obtener del contexto, si no está disponible usar la prop
  const context = usePresupuesto();
  const presupuesto = presupuestoProp || context?.presupuesto;
  const setPresupuesto = context?.setPresupuesto;

  const isSticky = usePresupuestoSticky();

  const {
    handleEnviarPresupuesto,
    handlePrint,
    getWhatsAppLink,
    enviandoPresupuesto,
    snackbar,
    closeSnackbar,
  } = usePresupuestoHandlers({
    presupuesto,
    onPresupuestoUpdate: setPresupuesto,
  });

  const vehicleInfo = presupuesto.auto
    ? `${presupuesto.auto.brand} ${presupuesto.auto.model} - ${presupuesto.auto.patent}`
    : presupuesto.informacionAuto || "N/A";

  const whatsappLink = getWhatsAppLink();

  return (
    <>
      {/* Spacer cuando el header es sticky */}
      {isSticky && <Box sx={{ height: "100px" }} />}

      <Box
        sx={{
          position: isSticky ? "fixed" : "relative",
          top: isSticky ? 64 : "auto",
          left: 0,
          right: 0,
          zIndex: isSticky ? 1000 : "auto",
          backgroundColor: "background.default",
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 1.5,
          pt: isSticky ? 2 : 3,
          mb: isSticky ? 0 : 3,
          px: isSticky ? 3 : 0,
          transition: "all 0.3s ease",
          ml: isSticky ? { xs: 0, sm: "240px" } : 0,
          width: isSticky ? { xs: "100%", sm: "calc(100% - 240px)" } : "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <PresupuestoInfo
            presupuesto={presupuesto}
            vehicleInfo={vehicleInfo}
          />

          <PresupuestoActions
            presupuesto={presupuesto}
            enviandoPresupuesto={enviandoPresupuesto}
            whatsappLink={whatsappLink}
            onEnviar={handleEnviarPresupuesto}
            onPrint={handlePrint}
          />
        </Box>
      </Box>

      <PresupuestoSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </>
  );
}

export default PresupuestoHeader;
