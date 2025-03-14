import HandymanIcon from "@mui/icons-material/Handyman";

import { Box, Grid, Paper, Typography } from "@mui/material";
import ReparacionesTercerosFormSection from "../../ReparacionesTercerosFormSection";

function ReparacionesSection() {
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
        <HandymanIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" component="h2">
          Reparación / Repuestos de terceros
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ReparacionesTercerosFormSection />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default ReparacionesSection;
