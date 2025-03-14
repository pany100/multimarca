import { getFormattedPrice } from "@/utils/fieldHelper";
import ConstructionIcon from "@mui/icons-material/Construction";

import useNuevaOrden from "@/hooks/orden-reparacion/useNuevaOrden";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import TrabajosRealizadosFormSection from "../../TrabajosRealizadosFormSection";

function TrabajosSection() {
  const { control } = useFormContext();
  const { manoDeObra } = useNuevaOrden({ control });
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
      <Box display="flex" alignItems="center" mb={2}>
        <ConstructionIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" component="h2">
          Trabajos Realizados
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TrabajosRealizadosFormSection />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" component="h2" textAlign="right">
            Mano de obra:{" "}
            {isNaN(manoDeObra) ? "0" : getFormattedPrice(manoDeObra.toFixed(2))}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default TrabajosSection;
