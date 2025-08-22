import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import useScrollToError from "@/hooks/useScrollToError";
import { Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";

function VentasDatosGeneralesSection() {
  const {
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { ventaEstadoOptions } = useFixedSelectData();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });

  return (
    <Grid container spacing={3}>
      <Grid item xs={6} md={6}>
        <CustomInputText name="fecha" label="Fecha" type="date" />
      </Grid>
      <Grid item xs={6} md={6} ref={(el) => registerFieldRef("estado", el)}>
        <CustomSelect
          name="estado"
          label="Estado"
          options={ventaEstadoOptions}
        />
      </Grid>
    </Grid>
  );
}

export default VentasDatosGeneralesSection;
