"use client";

import { Box, Typography } from "@mui/material";

interface PedidoClienteInfoProps {
  observaciones?: string | null;
}

export const PedidoClienteInfo = ({
  observaciones,
}: PedidoClienteInfoProps) => {
  return (
    <>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}
      >
        Pedido del Cliente
      </Typography>
      {observaciones ? (
        <Box
          sx={{
            p: 2,
            backgroundColor: "#fffbea",
            borderRadius: 1,
            border: "1px solid #fef3c7",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#92400e",
              whiteSpace: "pre-wrap",
            }}
          >
            {observaciones}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Sin pedido del cliente
        </Typography>
      )}
    </>
  );
};
