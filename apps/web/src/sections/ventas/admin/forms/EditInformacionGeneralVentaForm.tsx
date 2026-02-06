import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import FilesInput from "@/components/formV2/files/FilesInput";
import useClientesAutocomplete from "@/hooks/useClientesAutocomplete";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import { Box, Divider, Grid, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface EditInformacionGeneralVentaFormProps {
  initialTab?: number;
  onErrorUploadingCedula?: (error: string) => void;
}

const EditInformacionGeneralVentaForm = ({
  initialTab = 0,
  onErrorUploadingCedula,
}: EditInformacionGeneralVentaFormProps) => {
  const { watch, setValue, control } = useFormContext();
  const { ventaEstadoOptions } = useFixedSelectData();
  const { searchClientes, initialCliente } = useClientesAutocomplete();

  const clienteId = watch("clienteId");
  const informacionCliente = watch("informacionCliente");
  const [tabValue, setTabValue] = useState(initialTab);

  useEffect(() => {
    setTabValue(initialTab);
  }, [initialTab]);

  // Cuando se selecciona un cliente existente, limpiar información manual
  useEffect(() => {
    if (clienteId) {
      setValue("informacionCliente", "");
    }
  }, [clienteId, setValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Solo limpiar clienteId cuando se va al tab de cliente nuevo
    if (newValue === 1) {
      setValue("clienteId", null);
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Información del Cliente con Tabs */}
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
        <Grid item xs={12}>
          <CustomAutocompleteInput
            name="clienteId"
            label="Cliente"
            searchOptions={searchClientes}
            initialOptions={initialCliente}
          />
        </Grid>
      ) : (
        // Cliente nuevo
        <>
          <Grid item xs={12}>
            <CustomInputText
              name="informacionCliente"
              label="Datos del cliente"
              placeholder="Nombre, teléfono, dirección, etc."
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="cedulaFilePath"
              control={control}
              render={({ field }) => (
                <Box
                  sx={{
                    border: 1,
                    borderColor: "grey.400",
                    p: 2,
                    borderRadius: 1,
                  }}
                >
                  <FilesInput
                    label="Cédula (imagen)"
                    filePath={field.value || null}
                    setFilePath={field.onChange}
                    acceptedTypes="images"
                    onErrorUploading={onErrorUploadingCedula}
                  />
                </Box>
              )}
            />
          </Grid>
        </>
      )}

      <Grid item xs={12}>
        <Divider sx={{ my: 1, borderColor: "divider" }} />
      </Grid>

      {/* Estado */}
      <Grid item xs={12} md={6}>
        <CustomSelect
          name="estado"
          label="Estado"
          options={ventaEstadoOptions}
        />
      </Grid>

      {/* Fecha */}
      <Grid item xs={12} md={6}>
        <CustomInputText
          name="fecha"
          label="Fecha"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  );
};

export default EditInformacionGeneralVentaForm;
