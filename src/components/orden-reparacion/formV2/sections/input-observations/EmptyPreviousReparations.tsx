import { Paper, Typography } from "@mui/material";

function EmptyPreviousReparations() {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
      <Typography
        color="text.secondary"
        sx={{ fontStyle: "italic", textAlign: "center" }}
      >
        No hay reparaciones previas para este vehículo
      </Typography>
    </Paper>
  );
}

export default EmptyPreviousReparations;
