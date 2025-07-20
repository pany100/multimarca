import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import useClientesAutocomplete from "@/hooks/useClientesAutocomplete";
import useScrollToError from "@/hooks/useScrollToError";
import useVentasInformacionCliente from "@/hooks/useVentasInformacionCliente";
import { Box, Grid, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

function IngresoVentaClienteSection() {
  const {
    formState: { errors, isSubmitted },
    watch,
    setValue,
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });
  const { searchClientes, initialCliente } = useClientesAutocomplete();
  const { searchInformacionCliente, initialInformacionCliente } =
    useVentasInformacionCliente();

  const clienteId = watch("clienteId");
  const informacionCliente = watch("informacionCliente");
  const [tabValue, setTabValue] = useState(
    clienteId || (!clienteId && !informacionCliente) ? 0 : 1
  );

  console.log(clienteId, informacionCliente);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // Limpiar el valor del campo no visible al cambiar de tab
    if (newValue === 0) {
      // Cambiando a "Cliente existente en sistema"
      setValue("informacionCliente", null, { shouldValidate: true });
    } else {
      // Cambiando a "Cliente nuevo"
      setValue("clienteId", null, { shouldValidate: true });
    }
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
          <CustomAutocompleteInput
            name="informacionCliente"
            label="Información del cliente"
            searchOptions={searchInformacionCliente}
            initialOptions={initialInformacionCliente}
          />
        </Grid>
      )}
    </Grid>
  );
}

export default IngresoVentaClienteSection;
