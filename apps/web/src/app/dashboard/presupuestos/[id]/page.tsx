"use client";

import { Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { useParams } from "next/navigation";

const PresupuestoAdminPage = () => {
  const params = useParams();
  const presupuestoId = params?.id as string;

  if (!presupuestoId) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Administración de Presupuesto
          </Typography>
          <Typography variant="h6" color="text.secondary">
            ID del Presupuesto: {presupuestoId}
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Esta es una página temporal. Aquí se implementará la administración completa del presupuesto.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PresupuestoAdminPage;
