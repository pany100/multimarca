import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import useRepuestosObjectAutocomplete from "@/hooks/orden-reparacion/useRepuestosObjectAutocomplete";
import useStockObjectAutocomplete from "@/hooks/orden-reparacion/useStockObjectAutocomplete";
import { Grid } from "@mui/material";
import ORepObjectAutocomplete from "../../commons/inputs/ORepObjectAutocomplete";
import ORepTextField from "../../commons/inputs/ORepTextField";

function RepuestosUsadosInnerForm() {
  const { newItem, setNewItem, currentItem } = useFormDataWithModalContext();
  const { searchStockObject, initialStock } = useStockObjectAutocomplete();
  const { selectOption } = useRepuestosObjectAutocomplete();
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <ORepObjectAutocomplete
          label="Repuesto"
          searchOptions={searchStockObject}
          initialOptions={initialStock}
          selectOption={selectOption}
          initialValue={currentItem?.stock?.id}
        />
      </Grid>
      <Grid item xs={12}>
        <ORepTextField
          label="Precio Compra"
          type="number"
          defaultValue={
            newItem?.precioCompra || currentItem?.precioCompra || ""
          }
          onChange={(e) =>
            setNewItem({ ...newItem, precioCompra: Number(e.target.value) })
          }
        />
      </Grid>
      <Grid item xs={12}>
        <ORepTextField
          label="Unidades Consumidas"
          type="number"
          defaultValue={
            newItem?.unidadesConsumidas || currentItem?.unidadesConsumidas || ""
          }
          onChange={(e) =>
            setNewItem({
              ...newItem,
              unidadesConsumidas: Number(e.target.value),
            })
          }
        />
      </Grid>
      <Grid item xs={12}>
        <ORepTextField
          label="Precio Venta"
          type="number"
          defaultValue={newItem?.precioVenta || currentItem?.precioVenta || ""}
          onChange={(e) =>
            setNewItem({ ...newItem, precioVenta: Number(e.target.value) })
          }
        />
      </Grid>
    </Grid>
  );
}

export default RepuestosUsadosInnerForm;
