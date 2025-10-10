import { Grid } from "@mui/material";
import CalendarioCellMenu from "./CalendarioCellMenu";
import CalendarioGrid from "./CalendarioGrid";
import CalendarioHeader from "./CalendarioHeader";
import DeleteRecordatorioModal from "./DeleteRecordatorioModal";
import RecordatorioModal from "./RecordatorioModal";
import { MenuUIProvider } from "./contexts/MenuUIContext";

function Calendario() {
  return (
    <MenuUIProvider>
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
        <CalendarioCellMenu />
        <RecordatorioModal />
        <DeleteRecordatorioModal />
      </Grid>
    </MenuUIProvider>
  );
}

export default Calendario;
