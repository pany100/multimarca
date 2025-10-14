import { Box, Grid, Typography } from "@mui/material";
import { useEmpleadosContext } from "../context/EmpleadosContext";
import MecanicosImagenData from "./MecanicosImagenData";

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
        <MecanicosImagenData
          filePath={empleado?.dniImagePath || null}
          alt="DNI"
        />
      </Box>
    </Grid>
  );
}

export default MecanicosPerfilHeader;
