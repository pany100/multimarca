import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import useStockObjectAutocomplete, {
  StockObject,
} from "@/hooks/orden-reparacion/useStockObjectAutocomplete";
import NonFormObjectAutocomplete, {
  ObjectAutocomplete,
} from "@/sections/commons/NonFormObjectAutocomplete";
import { Grid, TextField } from "@mui/material";

function RepuestosUsadosInnerForm() {
  const { newItem, setNewItem, currentItem } = useFormDataWithModalContext();
  const { searchStockObject, initialStock } = useStockObjectAutocomplete();

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <NonFormObjectAutocomplete
          label="Repuesto"
          searchOptions={searchStockObject}
          getOptionLabel={(option: { object: StockObject }) =>
            option.object.name
          }
          initialOptions={initialStock}
          initialValue={currentItem?.stock?.id}
          selectOption={(option: ObjectAutocomplete | null) => {
            if (option) {
              const precioVentaCalculado =
                option.object.buyPrice *
                (1 + (option.object.markup || 0) / 100);
              setNewItem({
                id: option.value,
                ...newItem,
                stock: {
                  id: option.value,
                  name: option.object.name,
                },
                precioCompra: option.object.buyPrice,
                precioVenta: precioVentaCalculado.toFixed(2),
              });
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Precio Compra"
          type="number"
          value={newItem?.precioCompra || currentItem?.precioCompra || ""}
          onChange={(e) =>
            setNewItem({ ...newItem, precioCompra: Number(e.target.value) })
          }
          fullWidth
          variant="outlined"
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Precio Venta"
          type="number"
          value={newItem?.precioVenta || currentItem?.precioVenta || ""}
          onChange={(e) =>
            setNewItem({ ...newItem, precioVenta: Number(e.target.value) })
          }
          fullWidth
          variant="outlined"
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Unidades Consumidas"
          type="number"
          value={
            newItem?.unidadesConsumidas || currentItem?.unidadesConsumidas || ""
          }
          onChange={(e) =>
            setNewItem({
              ...newItem,
              unidadesConsumidas: Number(e.target.value),
            })
          }
          fullWidth
          variant="outlined"
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  );
}

export default RepuestosUsadosInnerForm;
