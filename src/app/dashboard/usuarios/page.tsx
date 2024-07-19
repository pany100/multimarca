import React from "react";
import { Typography, Box } from "@mui/material";

const UsuariosPage = () => {
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Gestión de Usuarios
      </Typography>
      {/* Aquí puedes agregar la lista de usuarios, formularios, etc. */}
      <Typography variant="body1">
        Aquí puedes gestionar los usuarios del sistema.
      </Typography>
    </Box>
  );
};

export default UsuariosPage;
