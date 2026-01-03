import ORepObjectAutocomplete from "@/components/orden-reparacion/formV2/commons/inputs/ORepObjectAutocomplete";
import ORepTextField from "@/components/orden-reparacion/formV2/commons/inputs/ORepTextField";
import useTrabajosObjectAutocomplete from "@/hooks/orden-reparacion/useTrabajosObjectAutocomplete";
import { Grid, Typography } from "@mui/material";
import { useTrabajosContext } from "../contexts/TrabajosContext";

interface ManoDeObra {
  id: number | string;
  name: string;
  sellPrice: string;
}

interface TrabajoDeListaFormProps {
  initialManoDeObra?: ManoDeObra | null;
}

function TrabajoDeListaForm({ initialManoDeObra }: TrabajoDeListaFormProps) {
  const { searchTrabajo, initialTrabajo } = useTrabajosObjectAutocomplete();
  const {
    precioUnitario,
    setPrecioUnitario,
    diasParaRecordatorio,
    setDiasParaRecordatorio,
    setDescripcion,
  } = useTrabajosContext();
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <ORepObjectAutocomplete
          label="Trabajo"
          searchOptions={searchTrabajo}
          initialOptions={initialTrabajo}
          selectOption={(option) => {
            setDescripcion(option?.object.name);
            setPrecioUnitario(Number(option?.object.sellPrice));
            setDiasParaRecordatorio(null);
          }}
          initialValue={initialManoDeObra?.id.toString()}
        />
      </Grid>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <ORepTextField
          label="Precio"
          type="number"
          value={precioUnitario || ""}
          onChange={(e) => setPrecioUnitario(Number(e.target.value))}
        />
      </Grid>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Recordatorio (opcional)
        </Typography>
        <ORepTextField
          label="Días para Recordatorio"
          type="number"
          value={diasParaRecordatorio || ""}
          onChange={(e) => setDiasParaRecordatorio(Number(e.target.value))}
        />
      </Grid>
    </Grid>
  );
}

export default TrabajoDeListaForm;
