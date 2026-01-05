"use client";

import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { Box, Typography } from "@mui/material";

interface ClienteInfoVentaProps {
  cliente?: {
    fullName: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  informacionCliente?: string | null;
}

export const ClienteInfoVenta = ({
  cliente,
  informacionCliente,
}: ClienteInfoVentaProps) => {
  return (
    <>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}
      >
        Cliente
      </Typography>

      {cliente ? (
        <>
          {/* Nombre */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <PersonIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {cliente.fullName}
            </Typography>
          </Box>

          {/* Teléfono */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <PhoneIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {cliente.phone || "N/A"}
            </Typography>
          </Box>

          {/* Email */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <EmailIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {cliente.email || "N/A"}
            </Typography>
          </Box>

          {/* Dirección */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LocationOnIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {cliente.address || "N/A"}
            </Typography>
          </Box>
        </>
      ) : informacionCliente ? (
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          <PersonIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20, mt: 0.5 }} />
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
            {informacionCliente}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Sin información del cliente
        </Typography>
      )}
    </>
  );
};
