"use client";

import ExtraccionForm from "@/sections/extracciones/ExtraccionForm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Card, CardContent, CardHeader } from "@mui/material";
import Link from "next/link";

const NuevaExtraccionPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Button
          component={Link}
          href="/dashboard/extracciones"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver al listado
        </Button>
      </Box>
      <Card>
        <CardHeader
          title="Nueva Extracción"
          subheader="Cargá una salida de dinero"
          sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 1 }}
        />
        <CardContent sx={{ px: { xs: 3, md: 4 }, pb: 4 }}>
          <ExtraccionForm mode="create" />
        </CardContent>
      </Card>
    </Box>
  );
};

export default NuevaExtraccionPage;
