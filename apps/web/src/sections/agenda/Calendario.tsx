import { Grid } from "@mui/material";
import CalendarioGrid from "./CalendarioGrid";
import CalendarioHeader from "./CalendarioHeader";

function Calendario() {
  return (
    <Grid
      container
      spacing={1}
      sx={{
        width: "100%",
        mx: "auto",
      }}
    >
      <CalendarioHeader />
      <CalendarioGrid />
    </Grid>
  );
}

export default Calendario;
