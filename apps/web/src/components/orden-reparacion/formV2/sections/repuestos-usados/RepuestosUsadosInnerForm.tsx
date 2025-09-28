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
          value={newItem?.precioCompra}
          onChange={(e) => {
            const value = e.target.value;
            setNewItem({
              ...newItem,
              precioCompra: value === "" ? "" : Number(value),
            });
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <ORepTextField
          label="Precio Unitario"
          type="number"
          value={
            newItem?.precioUnitario ||
            newItem?.precioVenta / newItem?.unidadesConsumidas ||
            ""
          }
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              setNewItem({
                ...newItem,
                precioUnitario: 0,
                precioVenta: 0,
              });
            } else {
              const unitPrice = Number(value);
              setNewItem({
                ...newItem,
                precioUnitario: unitPrice,
                precioVenta: unitPrice * (newItem?.unidadesConsumidas || 1),
              });
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <ORepTextField
          label="Unidades Consumidas"
          type="number"
          value={newItem?.unidadesConsumidas}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              setNewItem({
                ...newItem,
                unidadesConsumidas: "",
              });
            } else {
              const units = Number(value);
              setNewItem({
                ...newItem,
                unidadesConsumidas: units,
                precioVenta: (newItem?.precioUnitario || 0) * units,
              });
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <ORepTextField
          label="Precio Venta"
          type="number"
          value={newItem?.precioVenta}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              setNewItem({
                ...newItem,
                precioVenta: 0,
                precioUnitario: 0,
              });
            } else {
              const salePrice = Number(value);
              setNewItem({
                ...newItem,
                precioVenta: salePrice,
                precioUnitario: (
                  salePrice / (newItem?.unidadesConsumidas || 1)
                ).toFixed(2),
              });
            }
          }}
        />
      </Grid>
    </Grid>
  );
}

export default RepuestosUsadosInnerForm;
