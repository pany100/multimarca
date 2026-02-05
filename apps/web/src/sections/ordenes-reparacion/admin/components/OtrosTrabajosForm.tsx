import ORepTextField from "@/components/orden-reparacion/formV2/commons/inputs/ORepTextField";
import { Grid, Typography } from "@mui/material";
import { useTrabajosContext } from "../contexts/TrabajosContext";

function OtrosTrabajosForm() {
  const {
    descripcion,
    setDescripcion,
    precioUnitario,
    setPrecioUnitario,
    diasParaRecordatorio,
    setDiasParaRecordatorio,
    pdfName,
    setPdfName,
  } = useTrabajosContext();
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <ORepTextField
          label="Nombre del Trabajo"
          value={descripcion || ""}
          onChange={(e) => setDescripcion(e.target.value)}
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
        <ORepTextField
          label="Nombre del PDF (opcional)"
          value={pdfName || ""}
          onChange={(e) => setPdfName(e.target.value)}
          placeholder="-"
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

export default OtrosTrabajosForm;
