import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
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
      <SnackbarProvider>
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
        <FormSnackbar />
      </SnackbarProvider>
    </MenuUIProvider>
  );
}

export default Calendario;
