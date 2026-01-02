"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import { Grid } from "@mui/material";

const EditEstadoYFechasForm = () => {
  const { orepEstadoOptions } = useFixedSelectData();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <CustomSelect
          name="estado"
          label="Estado"
          options={orepEstadoOptions}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomInputText
          name="fechaEntradaReparacion"
          label="Fecha de Entrada a Reparación"
          type="date"
        />
      </Grid>
      <Grid item xs={12}>
        <CustomInputText
          name="fechaSalidaReparacion"
          label="Fecha de Salida de Reparación"
          type="date"
        />
      </Grid>
    </Grid>
  );
};

export default EditEstadoYFechasForm;
