import EngineeringIcon from "@mui/icons-material/Engineering";

import { Box, Grid, Paper, Typography } from "@mui/material";
import MecanicoFormSection from "../../MecanicoFormSection";

function MecanicosSection() {
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
        <EngineeringIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" component="h2">
          Mecánicos
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MecanicoFormSection />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default MecanicosSection;
