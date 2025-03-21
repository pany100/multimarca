import useChequesAutocomplete from "@/hooks/useChequesAutocomplete";
import { Fade, Grid } from "@mui/material";
import CustomAutocompleteInput from "./CustomAutocomplete";

function NumeroChequeField({
  nuevoFormVisible,
}: {
  nuevoFormVisible: boolean;
}) {
  const { searchCheques, initialCheque } = useChequesAutocomplete();
  return (
    <Fade
      in={!nuevoFormVisible}
      timeout={500}
      unmountOnExit
      style={{ display: nuevoFormVisible ? "none" : "block" }}
    >
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomAutocompleteInput
              name="chequeId"
              label="Nro de cheque"
              searchOptions={searchCheques}
              initialOptions={initialCheque}
            />
          </Grid>
        </Grid>
      </div>
    </Fade>
  );
}

export default NumeroChequeField;
