import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import useTrabajosObjectAutocomplete from "@/hooks/orden-reparacion/useTrabajosObjectAutocomplete";
import { Grid, Typography } from "@mui/material";
import ORepObjectAutocomplete from "../../commons/inputs/ORepObjectAutocomplete";
import ORepTextField from "../../commons/inputs/ORepTextField";

function TrabajoDeListaForm() {
  const { newItem, setNewItem, currentItem } = useFormDataWithModalContext();
  const { searchTrabajo, initialTrabajo } = useTrabajosObjectAutocomplete();
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <ORepObjectAutocomplete
          label="Trabajo"
          searchOptions={searchTrabajo}
          initialOptions={initialTrabajo}
          selectOption={(option) => {
            setNewItem({
              ...newItem,
              manoDeObra: option?.object,
              id: Math.floor(Math.random() * 1000000),
            });
          }}
          initialValue={currentItem?.manoDeObra?.id}
        />
      </Grid>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <ORepTextField
          label="Precio"
          type="number"
          defaultValue={currentItem?.precioUnitario || ""}
          onChange={(e) =>
            setNewItem({ ...newItem, precioUnitario: Number(e.target.value) })
          }
        />
      </Grid>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Recordatorio (opcional)
        </Typography>
        <ORepTextField
          label="Días para Recordatorio"
          type="number"
          defaultValue={currentItem?.manoDeObra?.diasParaRecordatorio || ""}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              manoDeObra: {
                ...newItem.manoDeObra,
                diasParaRecordatorio: Number(e.target.value),
              },
            })
          }
        />
      </Grid>
    </Grid>
  );
}

export default TrabajoDeListaForm;
