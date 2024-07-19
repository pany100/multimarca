"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container, Typography, Box } from "@mui/material";

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1">
            Bienvenido a tu dashboard. Aquí puedes ver tu información privada.
          </Typography>
          {/* Agrega aquí el contenido de tu dashboard */}
        </Box>
      </Container>
    </ProtectedRoute>
  );
};

export default Dashboard;
