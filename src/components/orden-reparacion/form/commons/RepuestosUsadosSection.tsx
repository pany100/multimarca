import InventoryIcon from "@mui/icons-material/Inventory";

import { Box, Grid, Paper, Typography } from "@mui/material";
import RepuestoUsadoFormSection from "../../RepuestoUsadoFormSection";

function RepuestosUsadosSection() {
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
        <InventoryIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" component="h2">
          Repuestos Usados
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <RepuestoUsadoFormSection />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default RepuestosUsadosSection;
