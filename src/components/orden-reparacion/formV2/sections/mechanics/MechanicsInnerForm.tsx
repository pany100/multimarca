import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import useAllMechanics from "@/hooks/orden-reparacion/useAllMechanics";
import NonFormSelect from "@/sections/commons/NonFormSelect";
import { Grid, TextField } from "@mui/material";

function MechanicsInnerForm() {
  const { newItem, setNewItem, currentItem } = useFormDataWithModalContext();
  const { mechanics } = useAllMechanics();
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <NonFormSelect
          options={mechanics}
          onChange={(value: string) => {
            const selectedElement = mechanics.find((m) => m.value === value);
            setNewItem({
              ...newItem,
              id: value,
              name: selectedElement?.label || "",
            });
          }}
          initialValue={currentItem?.id}
          label="Mecánico"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Detalle del trabajo"
          value={currentItem?.detalle}
          onChange={(e) => setNewItem({ ...newItem, detalle: e.target.value })}
          multiline
          fullWidth
          rows={3}
          variant="outlined"
          placeholder="Descripción del trabajo a realizar..."
        />
      </Grid>
    </Grid>
  );
}

export default MechanicsInnerForm;
