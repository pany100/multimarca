import useFixedSelectData from "@/hooks/useFixedSelectData";
import useScrollToError from "@/hooks/useScrollToError";
import useUsersAutocomplete from "@/hooks/useUsersAutocomplete";
import { Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";
import CustomInputDate from "../formV2/CustomInputDate";
import CustomInputText from "../formV2/CustomInputText";
import CustomSelect from "../formV2/CustomSelect";
import TareasAdministrativas from "./TareasAdministrativas";

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
        <CustomInputText name="fecha" label="Fecha de Creación" type="date" />
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        ref={(el) => registerFieldRef("fechaEnvio", el)}
      >
        <CustomInputText name="fechaEnvio" label="Fecha de envio" type="date" />
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
        md={12}
        ref={(el) => registerFieldRef("tareasAdministrativas", el)}
      >
        <TareasAdministrativas name="tareasAdministrativas" />
      </Grid>
    </Grid>
  );
}

export default PresupuestoInformacionGeneral;
