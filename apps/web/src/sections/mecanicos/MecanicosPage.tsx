import {
  Box,
  Card,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { useEmpleadosContext } from "./context/EmpleadosContext";
import MecanicosActivity from "./perfil/MecanicosActivity";
import MecanicosCertificadosData from "./perfil/MecanicosCertificadosData";
import MecanicosDocumentacionData from "./perfil/MecanicosDocumentacionData";
import MecanicosSueldosData from "./perfil/MecanicosSueldosData";
import MecanicosInasistenciasData from "./perfil/MecanicosInasistenciasData";
import MecanicosLlegadasTardeData from "./perfil/MecanicosLlegadasTardeData";
import MecanicosHorasExtrasData from "./perfil/MecanicosHorasExtrasData";
import MecanicosPremiosData from "./perfil/MecanicosPremiosData";
import MecanicosApercibimientosData from "./perfil/MecanicosApercibimientosData";
import MecanicosLicenciasData from "./perfil/MecanicosLicenciasData";
import MecanicosPerfilHeader from "./perfil/MecanicosPerfilHeader";
import MecanicosPersonalData from "./perfil/MecanicosPersonalData";
import MecanicosVacacionesData from "./perfil/MecanicosVacacionesData";

function MecanicosPage() {
  const { loading, empleado } = useEmpleadosContext();
  if (loading) {
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Card
        sx={{
          bgcolor: "primary.main",
          color: "white",
          p: 2,
          mb: 3,
        }}
      >
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h6" fontWeight="bold">
              Empleado
            </Typography>
          </Grid>
        </Grid>
      </Card>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 2, mb: 2 }}
      >
        <MecanicosPerfilHeader />
      </Grid>

      <MecanicosPersonalData />
      {empleado?.tipo === "Mecanico" && <MecanicosActivity />}
      <MecanicosDocumentacionData />
      <MecanicosCertificadosData />
      <MecanicosSueldosData />
      <MecanicosVacacionesData />
      <MecanicosLicenciasData />
      <MecanicosInasistenciasData />
      <MecanicosLlegadasTardeData />
      <MecanicosHorasExtrasData />
      <MecanicosPremiosData />
      <MecanicosApercibimientosData />
    </Container>
  );
}

export default MecanicosPage;
