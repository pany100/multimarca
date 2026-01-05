"use client";

import { useFetch } from "@/contexts/FetchContext";
import { useGeneratePdf } from "@/hooks/orden-reparacion/useGeneratePdf";
import { usePresupuesto } from "@/sections/presupuestos/admin/contexts/PresupuestoContext";
import { getFormattedDateArg } from "@/utils/fieldHelper";
import PrintIcon from "@mui/icons-material/Print";
import SendIcon from "@mui/icons-material/Send";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Alert,
  Box,
  Button,
  Chip,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

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

// Helper function to map estado to a color (chip color)
const mapEstadoColor = (
  estado: string
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" => {
  switch (estado) {
    case "EnPreparacion":
      return "warning"; // Orange
    case "Terminado":
      return "info"; // Blue
    case "Enviado":
      return "primary"; // Blue
    case "Aceptado":
      return "success"; // Green
    case "Rechazado":
      return "error"; // Red
    case "Descartado":
      return "default"; // Gray
    default:
      return "default";
  }
};

function PresupuestoHeader({
  presupuesto: presupuestoProp,
}: {
  presupuesto?: any;
}) {
  const { authFetch } = useFetch();

  // Intentar obtener del contexto, si no está disponible usar la prop
  const context = usePresupuesto();
  const presupuesto = presupuestoProp || context?.presupuesto;
  const setPresupuesto = context?.setPresupuesto || (() => {});
  const [isSticky, setIsSticky] = useState(false);
  const [enviandoPresupuesto, setEnviandoPresupuesto] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const { generatePdf } = useGeneratePdf({
    onError: () => {
      setSnackbar({
        open: true,
        message: "Error al generar el PDF",
        severity: "error",
      });
    },
    printDirectly: true,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enviar presupuesto handler
  const handleEnviarPresupuesto = async () => {
    try {
      setEnviandoPresupuesto(true);
      const response = await authFetch(`/api/presupuestos/${presupuesto.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado: "Enviado",
          fechaEnvio: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const presupuestoActualizado = await response.json();
        setPresupuesto(presupuestoActualizado);
        setSnackbar({
          open: true,
          message: "Presupuesto enviado correctamente",
          severity: "success",
        });
      } else {
        throw new Error("Error al enviar el presupuesto");
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error al enviar el presupuesto",
        severity: "error",
      });
    } finally {
      setEnviandoPresupuesto(false);
    }
  };

  // WhatsApp share
  const createWhatsAppLink = () => {
    const phone =
      presupuesto.auto?.owner?.phone || presupuesto.informacionCliente;
    if (!phone) return "";

    const total = presupuesto.totalAPagar || presupuesto.total;
    const vehicleInfo = presupuesto.auto
      ? `${presupuesto.auto.brand} ${presupuesto.auto.model} (${presupuesto.auto.patent})`
      : presupuesto.informacionAuto || "su vehículo";

    const clientName = presupuesto.auto?.owner?.fullName || "Estimado cliente";

    const message = `Hola ${clientName}, le enviamos el presupuesto para ${vehicleInfo}. El total es de $${
      total?.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) || "0.00"
    }.`;

    return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
      message
    )}`;
  };

  // Print handler
  const handleClientePresupuestoPrint = async () => {
    await generatePdf(`/api/presupuestos/${presupuesto.id}/pdf-completo`);
  };

  const vehicleInfo = presupuesto.auto
    ? `${presupuesto.auto.brand} ${presupuesto.auto.model} - ${presupuesto.auto.patent}`
    : presupuesto.informacionAuto || "N/A";

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
          pb: 3,
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
              Presupuesto #{presupuesto.id} - {vehicleInfo}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Creado el {getFormattedDateArg(presupuesto.fecha)}
            </Typography>
            <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
              <Typography variant="body1" fontWeight="medium">
                Total a pagar:{" "}
                <Typography component="span" fontWeight="bold">
                  $
                  {presupuesto.totalAPagar?.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </Typography>
              </Typography>
            </Box>
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
              label={mapEstadoPresupuesto(presupuesto.estado)}
              color={mapEstadoColor(presupuesto.estado)}
              size="medium"
              sx={{
                fontWeight: 500,
                px: 1,
                "& .MuiChip-label": {
                  px: 1,
                },
              }}
            />

            {/* Enviar Presupuesto Button */}
            {presupuesto.estado === "Enviado" ? (
              <Tooltip title="Presupuesto ya enviado">
                <span>
                  <Button
                    variant="outlined"
                    startIcon={<SendIcon />}
                    disabled
                    sx={{ textTransform: "none" }}
                  >
                    Presupuesto Enviado
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                variant="outlined"
                startIcon={<SendIcon />}
                onClick={handleEnviarPresupuesto}
                disabled={enviandoPresupuesto}
                sx={{ textTransform: "none" }}
              >
                {enviandoPresupuesto ? "Enviando..." : "Enviar Presupuesto"}
              </Button>
            )}

            {/* Print button */}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handleClientePresupuestoPrint}
              sx={{ textTransform: "none" }}
            >
              Imprimir
            </Button>

            {/* WhatsApp button */}
            {(presupuesto.auto?.owner?.phone ||
              presupuesto.informacionCliente) && (
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
        </Box>
      </Box>

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
    </>
  );
}

export default PresupuestoHeader;
