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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Frente:
          </Typography>
          <MecanicosImagenData
            filePath={empleado?.dniFrentePath || null}
            alt="DNI frente"
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Dorso:
          </Typography>
          <MecanicosImagenData
            filePath={empleado?.dniDorsoPath || null}
            alt="DNI dorso"
          />
        </Box>
      </Box>
    </Grid>
  );
}

export default MecanicosPerfilHeader;
