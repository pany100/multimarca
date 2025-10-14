import { Box, Grid, Typography } from "@mui/material";
import Image from "next/image";
import { useEmpleadosContext } from "../context/EmpleadosContext";

function MecanicosPerfilHeader() {
  const { empleado } = useEmpleadosContext();
  return (
    <Grid item>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        {empleado && (
          <Typography
            variant="h5"
            sx={{
              color: "text.primary",
              fontWeight: 500,
            }}
          >
            {empleado.name}
          </Typography>
        )}
        {empleado?.dniImagePath ? (
          <Box
            sx={{
              borderRadius: 1,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              maxWidth: 300,
              maxHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "background.paper",
            }}
          >
            <Image
              src={empleado.dniImagePath}
              alt="DNI"
              width={300}
              height={300}
              style={{
                objectFit: "contain",
                display: "block",
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: 80,
              height: 50,
              bgcolor: "action.hover",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Sin foto
            </Typography>
          </Box>
        )}
      </Box>
    </Grid>
  );
}

export default MecanicosPerfilHeader;
