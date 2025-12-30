"use client";

import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import SpeedIcon from "@mui/icons-material/Speed";
import { Box, Chip, Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { CommonOrderCard } from "./components/CommonOrderCard";
import { useOrden } from "./contexts/OrdenContext";

const InformacionGeneralSection = () => {
  const { orden } = useOrden();

  // Form methods para el modal
  const methods = useForm({
    defaultValues: {
      kilometros: orden.kilometros,
      observacionesCliente: orden.observacionesCliente,
    },
  });

  // Handler para el submit del formulario
  const handleSubmit = async (data: any) => {
    console.log("Datos del formulario:", data);
    // Aquí irá la lógica para actualizar la información general
  };

  return (
    <CommonOrderCard
      title="Información General"
      formMethods={methods}
      onSubmit={handleSubmit}
      formContent={
        <>
          <Typography variant="body2" color="text.secondary">
            Formulario para editar kilómetros y observaciones (por implementar)
          </Typography>
        </>
      }
    >
      <Grid container spacing={3}>
        {/* Columna Izquierda - Cliente */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}
          >
            Cliente
          </Typography>

          {/* Nombre */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <PersonIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {orden.auto?.owner?.fullName || "N/A"}
            </Typography>
          </Box>

          {/* Teléfono */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <PhoneIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {orden.auto?.owner?.phone || "N/A"}
            </Typography>
          </Box>

          {/* Email */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <EmailIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {orden.auto?.owner?.email || "N/A"}
            </Typography>
          </Box>

          {/* Dirección */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LocationOnIcon
              sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
            />
            <Typography variant="body2" color="text.secondary">
              {orden.auto?.owner?.address || "N/A"}
            </Typography>
          </Box>
        </Grid>

        {/* Columna Derecha - Vehículo */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}
          >
            Vehículo
          </Typography>

          {/* Marca, Modelo y Patente */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <DirectionsCarIcon
                sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {orden.auto?.brand} {orden.auto?.model}
              </Typography>
            </Box>
            <Chip
              label={orden.auto?.patent || "N/A"}
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor: "action.hover",
              }}
            />
          </Box>

          {/* Año y Color */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: 4, mb: 2 }}
          >
            {orden.auto?.year} · {orden.auto?.color}
          </Typography>

          {/* Kilómetros */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "action.hover",
              p: 1.5,
              borderRadius: 1,
            }}
          >
            <SpeedIcon sx={{ color: "primary.main", mr: 1, fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {orden.kilometros?.toLocaleString() || "0"} km
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Observaciones del Cliente */}
      {orden.observacionesCliente && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: "#fffbea",
            borderRadius: 1,
            border: "1px solid #fef3c7",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 1, color: "#92400e" }}
          >
            Observaciones del cliente:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#92400e",
              whiteSpace: "pre-wrap",
            }}
          >
            {orden.observacionesCliente}
          </Typography>
        </Box>
      )}
    </CommonOrderCard>
  );
};

export default InformacionGeneralSection;
