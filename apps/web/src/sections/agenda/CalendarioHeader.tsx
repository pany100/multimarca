import { Grid, Paper, Typography, useTheme } from "@mui/material";

function CalendarioHeader() {
  const theme = useTheme();
  return (
    <>
      {[
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ].map((day) => (
        <Grid
          item
          xs={12 / 7}
          sm={12 / 7}
          md={12 / 7}
          key={day}
          sx={{
            minWidth: { xs: "auto", sm: "120px" },
            px: 0.5,
          }}
        >
          <Paper
            sx={{
              p: 1,
              textAlign: "center",
              bgcolor: theme.palette.primary.main,
              color: "white",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" },
              }}
            >
              {day}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </>
  );
}

export default CalendarioHeader;
