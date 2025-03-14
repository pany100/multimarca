import { Grid, Paper, Typography } from "@mui/material";
import ObservacionesEntradaForm from "../../ObservacionesEntradaForm";

function InputObservationsSection() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        gutterBottom
        sx={{ fontWeight: "medium", color: "primary.main" }}
      >
        Observaciones de entrada
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ObservacionesEntradaForm />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default InputObservationsSection;
