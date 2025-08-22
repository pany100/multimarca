import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import useClientesAutocomplete from "@/hooks/useClientesAutocomplete";
import useScrollToError from "@/hooks/useScrollToError";
import { Box, Grid, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

function VentasClienteSection() {
  const {
    formState: { errors, isSubmitted },
    watch,
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });
  const { searchClientes, initialCliente } = useClientesAutocomplete();

  const clienteId = watch("clienteId");
  const informacionCliente = watch("informacionCliente");
  const [tabValue, setTabValue] = useState(
    clienteId || (!clienteId && !informacionCliente) ? 0 : 1
  );

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
            aria-label="client selection tabs"
          >
            <Tab label="Cliente existente en sistema" />
            <Tab label="Cliente nuevo" />
          </Tabs>
        </Box>
      </Grid>
      {tabValue === 0 ? (
        // Cliente existente en sistema
        <Grid item xs={12} ref={(el) => registerFieldRef("clienteId", el)}>
          <CustomAutocompleteInput
            name="clienteId"
            label="Cliente"
            searchOptions={searchClientes}
            initialOptions={initialCliente}
          />
        </Grid>
      ) : (
        // Cliente nuevo
        <Grid
          item
          xs={12}
          ref={(el) => registerFieldRef("informacionCliente", el)}
        >
          <CustomInputText
            name="informacionCliente"
            label="Datos del cliente"
            placeholder="Nombre, teléfono, dirección, etc."
          />
        </Grid>
      )}
    </Grid>
  );
}

export default VentasClienteSection;
