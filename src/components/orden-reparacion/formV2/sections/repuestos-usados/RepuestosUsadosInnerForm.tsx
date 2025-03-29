import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import useStockAutocomplete from "@/hooks/useStockAutocomplete";
import NonFormAutocomplete from "@/sections/commons/NonFormAutocomplete";
import { Grid, TextField } from "@mui/material";

function RepuestosUsadosInnerForm() {
  const { newItem, setNewItem, currentItem } = useFormDataWithModalContext();
  const { searchStock } = useStockAutocomplete();
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <NonFormAutocomplete
          label="Repuesto"
          searchOptions={searchStock}
          selectOption={(option) => {
            if (option) {
              setNewItem({
                id: option.value,
                ...newItem,
                stock: {
                  id: option.value,
                  name: option.label,
                },
              });
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Precio Compra"
          type="number"
          value={currentItem?.precioCompra}
          onChange={(e) =>
            setNewItem({ ...newItem, precioCompra: Number(e.target.value) })
          }
          fullWidth
          variant="outlined"
          margin="normal"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Precio Venta"
          type="number"
          value={currentItem?.precioVenta}
          onChange={(e) =>
            setNewItem({ ...newItem, precioVenta: Number(e.target.value) })
          }
          fullWidth
          variant="outlined"
          margin="normal"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Unidades Consumidas"
          type="number"
          value={currentItem?.unidadesConsumidas}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              unidadesConsumidas: Number(e.target.value),
            })
          }
          fullWidth
          variant="outlined"
          margin="normal"
        />
      </Grid>
    </Grid>
  );
}

export default RepuestosUsadosInnerForm;
