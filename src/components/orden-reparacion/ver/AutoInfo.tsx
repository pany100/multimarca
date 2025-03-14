import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";
import { Grid, Typography } from "@mui/material";

function AutoInfo({ ordenReparacion }: { ordenReparacion: any }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Typography variant="h6" gutterBottom>
          <DirectionsCarIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Información del Vehículo
        </Typography>
        <Typography>
          <strong>Marca:</strong> {ordenReparacion.auto.brand}
        </Typography>
        <Typography>
          <strong>Modelo:</strong> {ordenReparacion.auto.model}
        </Typography>
        <Typography>
          <strong>Patente:</strong> {ordenReparacion.auto.patent}
        </Typography>
        <Typography>
          <strong>Kilómetros:</strong>{" "}
          {ordenReparacion.kilometros?.toLocaleString("es-AR")}
        </Typography>
      </Grid>

      <Grid item xs={12} md={4}>
        <Typography variant="h6" gutterBottom>
          <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Información del Cliente
        </Typography>
        <Typography>
          <strong>Nombre:</strong> {ordenReparacion.auto.owner.fullName}
        </Typography>
        <Typography>
          <strong>Teléfono:</strong> {ordenReparacion.auto.owner.phone}
        </Typography>
      </Grid>

      <Grid item xs={12} md={4}>
        <Typography variant="h6" gutterBottom>
          <CalendarTodayIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Fechas
        </Typography>
        <Typography>
          <strong>Entrada a taller:</strong>{" "}
          {ordenReparacion.fechaEntradaReparacion
            ? new Date(
                ordenReparacion.fechaEntradaReparacion
              ).toLocaleDateString()
            : "N/A"}
        </Typography>
        <Typography>
          <strong>Salida de taller:</strong>{" "}
          {ordenReparacion.fechaSalidaReparacion
            ? new Date(
                ordenReparacion.fechaSalidaReparacion
              ).toLocaleDateString()
            : "N/A"}
        </Typography>
      </Grid>
    </Grid>
  );
}

export default AutoInfo;
