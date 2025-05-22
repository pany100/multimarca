import useFixedSelectData from "@/hooks/useFixedSelectData";
import useScrollToError from "@/hooks/useScrollToError";
import useUsersAutocomplete from "@/hooks/useUsersAutocomplete";
import { Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";
import CustomAutocompleteInput from "../formV2/CustomAutocomplete";
import CustomInputDate from "../formV2/CustomInputDate";
import CustomSelect from "../formV2/CustomSelect";

function PresupuestoInformacionGeneral() {
  const {
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });
  const { presupuestoEstadoOptions } = useFixedSelectData();
  const { searchUsers, initialUser } = useUsersAutocomplete();

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
      <Grid
        item
        xs={12}
        md={6}
        ref={(el) => registerFieldRef("administrativoId", el)}
      >
        <CustomAutocompleteInput
          name="administrativoId"
          label="Administrativo"
          searchOptions={searchUsers}
          initialOptions={initialUser}
        />
      </Grid>
    </Grid>
  );
}

export default PresupuestoInformacionGeneral;
