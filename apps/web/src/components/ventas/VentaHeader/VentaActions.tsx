import {
  getEstadoVentaColor,
  getEstadoVentaLabel,
} from "@/sections/ordenes-reparacion/admin/helpers/estadoHelpers";
import PrintIcon from "@mui/icons-material/Print";
import { Box, Button, Chip, CircularProgress } from "@mui/material";

interface VentaActionsProps {
  venta: any;
  printLoading: boolean;
  onPrint: () => void;
}

export const VentaActions = ({
  venta,
  printLoading,
  onPrint,
}: VentaActionsProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
      }}
    >
      <Chip
        label={getEstadoVentaLabel(venta.estado)}
        color={getEstadoVentaColor(venta.estado)}
        size="medium"
        sx={{
          fontWeight: 500,
          px: 1,
          "& .MuiChip-label": {
            px: 1,
          },
        }}
      />
      <Button
        variant="outlined"
        startIcon={printLoading ? <CircularProgress size={20} /> : <PrintIcon />}
        onClick={onPrint}
        disabled={printLoading}
        sx={{ textTransform: "none" }}
      >
        Imprimir
      </Button>
    </Box>
  );
};
