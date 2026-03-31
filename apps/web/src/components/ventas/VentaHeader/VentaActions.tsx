import {
  getEstadoVentaColor,
  getEstadoVentaLabel,
} from "@/sections/ordenes-reparacion/admin/helpers/estadoHelpers";
import PrintIcon from "@mui/icons-material/Print";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Box, Button, Chip, CircularProgress } from "@mui/material";
import type React from "react";

interface VentaActionsProps {
  venta: any;
  printLoading: boolean;
  enviandoWhatsApp: boolean;
  isSticky?: boolean;
  onPrint: React.MouseEventHandler<HTMLButtonElement>;
  onEnviarWhatsApp: () => void;
}

export const VentaActions = ({
  venta,
  printLoading,
  enviandoWhatsApp,
  isSticky = false,
  onPrint,
  onEnviarWhatsApp,
}: VentaActionsProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isSticky ? 0.5 : 1,
        flexWrap: "wrap",
      }}
    >
      <Chip
        label={getEstadoVentaLabel(venta.estado)}
        color={getEstadoVentaColor(venta.estado)}
        size={isSticky ? "small" : "medium"}
        sx={{
          fontWeight: 500,
          px: isSticky ? 0.5 : 1,
          "& .MuiChip-label": {
            px: isSticky ? 0.5 : 1,
          },
        }}
      />
      <Button
        variant="outlined"
        size={isSticky ? "small" : "medium"}
        startIcon={!isSticky && (printLoading ? <CircularProgress size={20} /> : <PrintIcon />)}
        onClick={onPrint}
        disabled={printLoading}
        sx={{ textTransform: "none", minWidth: isSticky ? "auto" : undefined }}
      >
        {isSticky ? (printLoading ? <CircularProgress size={16} /> : <PrintIcon fontSize="small" />) : "Imprimir"}
      </Button>

      <Button
        variant="outlined"
        color="success"
        size={isSticky ? "small" : "medium"}
        startIcon={
          !isSticky &&
          (enviandoWhatsApp ? (
            <CircularProgress size={20} />
          ) : (
            <WhatsAppIcon />
          ))
        }
        onClick={onEnviarWhatsApp}
        disabled={enviandoWhatsApp}
        sx={{ textTransform: "none", minWidth: isSticky ? "auto" : undefined }}
      >
        {isSticky ? (
          enviandoWhatsApp ? (
            <CircularProgress size={16} />
          ) : (
            <WhatsAppIcon fontSize="small" />
          )
        ) : enviandoWhatsApp ? (
          "Enviando..."
        ) : (
          "Enviar por WhatsApp"
        )}
      </Button>
    </Box>
  );
};
