import CustomInputText from "@/components/formV2/CustomInputText";
import useClientesAutocomplete from "@/hooks/useClientesAutocomplete";
import { Checkbox, FormControlLabel, Grid } from "@mui/material";
import { Controller } from "react-hook-form";

function VentasDatosGeneralesSection() {
  const { searchClientes, initialCliente } = useClientesAutocomplete();

  return (
    <Grid container spacing={3}>
      <Grid item xs={6} md={4}>
        <CustomInputText name="fecha" label="Fecha" type="date" />
      </Grid>
      <Grid item xs={6} md={4}>
        <FormControlLabel
          control={
            <Controller
              name="presupuesto"
              render={({ field }) => (
                <Checkbox
                  {...field}
                  checked={field.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.onChange(e.target.checked)
                  }
                />
              )}
            />
          }
          label="¿Es presupuesto?"
        />
      </Grid>
    </Grid>
  );
}

export default VentasDatosGeneralesSection;
