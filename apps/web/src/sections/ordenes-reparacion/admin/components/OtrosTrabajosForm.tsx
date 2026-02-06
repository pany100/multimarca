import ORepTextField from "@/components/orden-reparacion/formV2/commons/inputs/ORepTextField";
import { Grid } from "@mui/material";
import { useTrabajosContext } from "../contexts/TrabajosContext";
import DiasParaRecordatorioInput from "./DiasParaRecordatorioInput";

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
        <DiasParaRecordatorioInput
          value={diasParaRecordatorio}
          onChange={setDiasParaRecordatorio}
        />
      </Grid>
    </Grid>
  );
}

export default OtrosTrabajosForm;
