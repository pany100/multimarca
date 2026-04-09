import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import {
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import ORepTextField from "../../commons/inputs/ORepTextField";

function AjustePrecioInnerForm() {
  const { newItem, setNewItem, currentItem } = useFormDataWithModalContext();

  if (!newItem?._initialized) {
    setNewItem({
      ...newItem,
      _initialized: true,
      id: currentItem?.id ?? Math.floor(Math.random() * 1000000),
      tipo: currentItem?.tipo || "fijo",
      esDescuento: currentItem?.esDescuento ?? false,
      esInterno: currentItem?.esInterno ?? false,
      orden: currentItem?.orden ?? 0,
    });
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          select
          fullWidth
          label="Efecto"
          variant="outlined"
          margin="normal"
          InputLabelProps={{ shrink: true }}
          defaultValue={currentItem?.esDescuento ? "descuento" : "incremento"}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              esDescuento: e.target.value === "descuento",
            })
          }
        >
          <MenuItem value="incremento">Incremento</MenuItem>
          <MenuItem value="descuento">Descuento</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <ORepTextField
          label="Descripcion"
          defaultValue={currentItem?.descripcion || ""}
          onChange={(e) =>
            setNewItem({ ...newItem, descripcion: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={6}>
        <ORepTextField
          label="Monto"
          type="number"
          defaultValue={currentItem?.monto || ""}
          onChange={(e) =>
            setNewItem({ ...newItem, monto: Number(e.target.value) })
          }
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          select
          fullWidth
          label="Tipo"
          variant="outlined"
          margin="normal"
          InputLabelProps={{ shrink: true }}
          defaultValue={currentItem?.tipo || "fijo"}
          onChange={(e) => setNewItem({ ...newItem, tipo: e.target.value })}
        >
          <MenuItem value="fijo">Fijo ($)</MenuItem>
          <MenuItem value="porcentual">Porcentual (%)</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              defaultChecked={currentItem?.esInterno || false}
              onChange={(e) =>
                setNewItem({ ...newItem, esInterno: e.target.checked })
              }
            />
          }
          label="Interno (se muestra como parte de la mano de obra en el informe al cliente)"
        />
      </Grid>
    </Grid>
  );
}

export default AjustePrecioInnerForm;
