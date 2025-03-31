import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import useReparacionTercerosObjectAutocomplete from "@/hooks/orden-reparacion/useReparacionTercerosObjectAutocomplete";
import { Grid } from "@mui/material";
import ORepObjectAutocomplete from "../../commons/inputs/ORepObjectAutocomplete";
import ORepTextField from "../../commons/inputs/ORepTextField";

function ReparacionTercerosInnerForm() {
  const { searchProveedores, initialProveedores } =
    useReparacionTercerosObjectAutocomplete();
  const { newItem, setNewItem, currentItem } = useFormDataWithModalContext();
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <ORepObjectAutocomplete
          label="Proveedor"
          searchOptions={searchProveedores}
          initialOptions={initialProveedores}
          selectOption={(option) =>
            setNewItem({
              ...newItem,
              proveedor: option?.object,
              id: Math.floor(Math.random() * 1000000),
            })
          }
          initialValue={currentItem?.proveedor?.id}
        />
      </Grid>
      <Grid item xs={12}>
        <ORepTextField
          label="Nombre"
          defaultValue={newItem?.nombre || currentItem?.nombre || ""}
          onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
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

export default ReparacionTercerosInnerForm;
