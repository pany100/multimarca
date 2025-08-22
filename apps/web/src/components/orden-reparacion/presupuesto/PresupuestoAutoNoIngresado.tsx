import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";
import {
  Box,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

function PresupuestoAutoNoIngresado({ presupuesto }: { presupuesto: any }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Format date to local string
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Section headers - only visible on mobile */}
        {isMobile && (
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                color: "primary.light",
              }}
            >
              <DirectionsCarIcon sx={{ mr: 1, fontSize: "1.5rem" }} />
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                Información del Vehículo
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Vehicle Information */}
        <Grid item xs={12} md={4}>
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                color: "primary.light",
              }}
            >
              <DirectionsCarIcon sx={{ mr: 1, fontSize: "1.5rem" }} />
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                Información del Vehículo
              </Typography>
            </Box>
          )}

          <Grid container spacing={1}>
            <Grid item xs={4} sm={3}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                }}
              >
                Vehículo:
              </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography variant="body2">N/A</Typography>
            </Grid>

            <Grid item xs={4} sm={3}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                }}
              >
                Kilómetros:
              </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography variant="body2">
                {presupuesto.kilometros?.toLocaleString("es-AR") || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Mobile divider */}
        {isMobile && (
          <Grid item xs={12}>
            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                mt: 1.5,
                color: "primary.light",
              }}
            >
              <PersonIcon sx={{ mr: 1, fontSize: "1.5rem" }} />
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                Información del Cliente
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Customer Information */}
        <Grid item xs={12} md={4}>
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                color: "primary.light",
              }}
            >
              <PersonIcon sx={{ mr: 1, fontSize: "1.5rem" }} />
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                Información del Cliente
              </Typography>
            </Box>
          )}

          <Grid container spacing={1}>
            <Grid item xs={4} sm={3}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                }}
              >
                Nombre:
              </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography variant="body2">
                {presupuesto.informacionCliente || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Mobile divider */}
        {isMobile && (
          <Grid item xs={12}>
            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                mt: 1.5,
                color: "primary.light",
              }}
            >
              <CalendarTodayIcon sx={{ mr: 1, fontSize: "1.5rem" }} />
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                Fechas
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Dates Information */}
        <Grid item xs={12} md={4}>
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                color: "primary.light",
              }}
            >
              <CalendarTodayIcon sx={{ mr: 1, fontSize: "1.5rem" }} />
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                Fechas
              </Typography>
            </Box>
          )}

          <Grid container spacing={1}>
            <Grid item xs={4} sm={3}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                }}
              >
                Creación:
              </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography variant="body2">
                {formatDate(presupuesto.fecha)}
              </Typography>
            </Grid>

            <Grid item xs={4} sm={3}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                }}
              >
                Fecha Envío al cliente:
              </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography variant="body2">
                {formatDate(presupuesto.fechaEnvio)}
              </Typography>
            </Grid>
            <Grid item xs={4} sm={3}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                }}
              >
                Fecha Respuesta:
              </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography variant="body2">
                {formatDate(presupuesto.fechaRespuesta)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PresupuestoAutoNoIngresado;
