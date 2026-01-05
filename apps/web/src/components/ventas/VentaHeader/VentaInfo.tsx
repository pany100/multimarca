import { getFormattedDate } from "@/utils/fieldHelper";
import { Box, Typography } from "@mui/material";

interface VentaInfoProps {
  venta: any;
}

export const VentaInfo = ({ venta }: VentaInfoProps) => {
  const clienteInfo = venta.cliente
    ? venta.cliente.fullName
    : venta.informacionCliente || "N/A";

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 600,
          fontSize: { xs: "1.5rem", md: "2rem" },
        }}
      >
        Venta #{venta.id} - {clienteInfo}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Fecha: {getFormattedDate(venta.fecha)}
      </Typography>
    </Box>
  );
};
