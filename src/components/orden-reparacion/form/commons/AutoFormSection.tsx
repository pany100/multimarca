import CustomAutocompleteInput from "@/components/formV2/CustomAutocomplete";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useAutosAutocomplete from "@/hooks/useAutosAutocomplete";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import useScrollToError from "@/hooks/useScrollToError";
import { Grid, Paper, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

function AutoFormSection() {
  const {
    formState: { errors, isSubmitted },
  } = useFormContext();
  const { searchAutos, initialAuto } = useAutosAutocomplete();
  const { orepEstadoOptions } = useFixedSelectData();
  const { registerFieldRef } = useScrollToError({ errors, isSubmitted });

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        gutterBottom
        sx={{ fontWeight: "medium", color: "primary.main" }}
      >
        Información del Vehículo y Fechas
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4} ref={(el) => registerFieldRef("autoId", el)}>
          <CustomAutocompleteInput
            name="autoId"
            label="Vehículo"
            searchOptions={searchAutos}
            initialOptions={initialAuto}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          ref={(el) => registerFieldRef("kilometros", el)}
        >
          <CustomInputText name="kilometros" label="Kilómetros" type="number" />
        </Grid>
        <Grid item xs={12} md={4} ref={(el) => registerFieldRef("estado", el)}>
          <CustomSelect
            name="estado"
            label="Estado"
            options={orepEstadoOptions}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          ref={(el) => registerFieldRef("fechaCreacion", el)}
        >
          <CustomInputText
            name="fechaCreacion"
            label="Fecha de Creación"
            type="date"
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          ref={(el) => registerFieldRef("fechaEntradaReparacion", el)}
        >
          <CustomInputText
            name="fechaEntradaReparacion"
            label="Fecha de Entrada a Reparación"
            type="date"
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          ref={(el) => registerFieldRef("fechaSalidaReparacion", el)}
        >
          <CustomInputText
            name="fechaSalidaReparacion"
            label="Fecha de Salida de Reparación"
            type="date"
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default AutoFormSection;
