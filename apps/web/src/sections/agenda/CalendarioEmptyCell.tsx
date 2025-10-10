import { Grid, Paper, useTheme } from "@mui/material";

function CalendarioEmptyCell() {
  const theme = useTheme();

  return (
    <Grid
      item
      xs={12 / 7}
      sm={12 / 7}
      md={12 / 7}
      sx={{
        minWidth: { xs: "auto", sm: "120px" },
        px: 0.5,
      }}
    >
      <Paper
        sx={{
          p: 1,
          height: { xs: 120, sm: 140, md: 160 },
          bgcolor: theme.palette.grey[100],
        }}
      />
    </Grid>
  );
}

export default CalendarioEmptyCell;
