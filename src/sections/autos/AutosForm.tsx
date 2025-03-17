import CustomAutocomplete from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useClientesAutocomplete from "@/hooks/useClientesAutocomplete";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  patent: yup.string().required("La patente es requerida"),
  brand: yup.string().required("La marca es requerida"),
  model: yup.string().required("El modelo es requerido"),
  year: yup.number().required("El año es requerido"),
  color: yup.string().required("El color es requerido"),
  kms: yup.number().required("Kilometraje es requerido"),
  valves: yup.number().nullable(),
  ownerId: yup.number().required("El propietario es requerido"),
  chassis_number: yup.string().nullable(),
  engine_number: yup.string().nullable(),
  transmission_type: yup.string().nullable(),
  observations: yup.string().nullable(),
});

const AutosForm = () => {
  const { searchClientes, initialCliente } = useClientesAutocomplete();

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información Del Vehículo
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <CustomInputText name="patent" label="Patente" />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText name="brand" label="Marca" />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText name="model" label="Modelo" />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText name="year" label="Año" type="number" />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText name="color" label="Color" />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText name="kms" label="Kilómetros" type="number" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="valves" label="Válvulas" type="number" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomAutocomplete
            name="ownerId"
            label="Propietario"
            searchOptions={searchClientes}
            initialOptions={initialCliente}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="chassis_number" label="Número de Chasis" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="engine_number" label="Número de Motor" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            name="transmission_type"
            label="Tipo de Transmisión"
            options={[
              { value: "Automático", label: "Automático" },
              { value: "Manual", label: "Manual" },
            ]}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText
            name="observations"
            label="Observaciones"
            multiline
            rows={4}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default AutosForm;
