import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import useScrollToError from "@/hooks/useScrollToError";
import { Box, Grid, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import CustomAutocompleteInput from "../formV2/CustomAutocomplete";
import CustomInputText from "../formV2/CustomInputText";

function PresupuestoAutoSection() {
  const {
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });
  const { searchAutos, initialAuto } = useAutosAutocomplete();
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="vehicle selection tabs"
          >
            <Tab label="Vehículo existente en sistema" />
            <Tab label="Vehículo nuevo" />
          </Tabs>
        </Box>
      </Grid>
      {tabValue === 0 ? (
        // Vehículo existente en sistema
        <Grid item xs={12} ref={(el) => registerFieldRef("autoId", el)}>
          <CustomAutocompleteInput
            name="autoId"
            label="Vehículo"
            searchOptions={searchAutos}
            initialOptions={initialAuto}
          />
        </Grid>
      ) : (
        <>
          <Grid
            item
            xs={12}
            md={6}
            ref={(el) => registerFieldRef("informacionAuto", el)}
          >
            <CustomInputText name="informacionAuto" label="Patente y modelo" />
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            ref={(el) => registerFieldRef("informacionCliente", el)}
          >
            <CustomInputText
              name="informacionCliente"
              label="Datos del cliente"
            />
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default PresupuestoAutoSection;
