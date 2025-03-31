import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import { Grid, Typography } from "@mui/material";
import ORepTextField from "../../commons/inputs/ORepTextField";

function OtrosTrabajosForm() {
  const { newItem, setNewItem, currentItem } = useFormDataWithModalContext();
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <ORepTextField
          label="Nombre del Trabajo"
          defaultValue={currentItem?.manoDeObra?.name || ""}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              manoDeObra: {
                ...newItem?.manoDeObra,
                name: e.target.value,
              },
              id: Math.floor(Math.random() * 1000000),
            })
          }
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

export default OtrosTrabajosForm;
