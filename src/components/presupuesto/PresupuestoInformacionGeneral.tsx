import useFixedSelectData from "@/hooks/useFixedSelectData";
import useScrollToError from "@/hooks/useScrollToError";
import { Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";
import CustomInputDate from "../formV2/CustomInputDate";
import CustomSelect from "../formV2/CustomSelect";

function PresupuestoInformacionGeneral() {
  const {
    control,
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });
  const { presupuestoEstadoOptions } = useFixedSelectData();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} ref={(el) => registerFieldRef("estado", el)}>
        <CustomSelect
          name="estado"
          label="Estado"
          options={presupuestoEstadoOptions}
        />
      </Grid>
      <Grid item xs={12} md={6} ref={(el) => registerFieldRef("fecha", el)}>
        <CustomInputDate name="fecha" label="Fecha de creación" />
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        ref={(el) => registerFieldRef("fechaEnvio", el)}
      >
        <CustomInputDate name="fechaEnvio" label="Fecha de envio" />
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        ref={(el) => registerFieldRef("fechaRespuesta", el)}
      >
        <CustomInputDate name="fechaRespuesta" label="Fecha de respuesta" />
      </Grid>
    </Grid>
  );
}

export default PresupuestoInformacionGeneral;
