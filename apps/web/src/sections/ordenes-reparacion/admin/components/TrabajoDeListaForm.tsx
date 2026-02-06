import ORepObjectAutocomplete from "@/components/orden-reparacion/formV2/commons/inputs/ORepObjectAutocomplete";
import ORepTextField from "@/components/orden-reparacion/formV2/commons/inputs/ORepTextField";
import useTrabajosObjectAutocomplete from "@/hooks/orden-reparacion/useTrabajosObjectAutocomplete";
import { Grid } from "@mui/material";
import { useTrabajosContext } from "../contexts/TrabajosContext";
import DiasParaRecordatorioInput from "./DiasParaRecordatorioInput";

interface ManoDeObra {
  id: number | string;
  name: string;
  sellPrice: string;
}

interface TrabajoDeListaFormProps {
  initialManoDeObra?: ManoDeObra | null;
}

function TrabajoDeListaForm({ initialManoDeObra }: TrabajoDeListaFormProps) {
  const { searchTrabajo, initialTrabajo } = useTrabajosObjectAutocomplete();
  const {
    precioUnitario,
    setPrecioUnitario,
    diasParaRecordatorio,
    setDiasParaRecordatorio,
    pdfName,
    setPdfName,
    setDescripcion,
  } = useTrabajosContext();
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <ORepObjectAutocomplete
          label="Trabajo"
          searchOptions={searchTrabajo}
          initialOptions={initialTrabajo}
          selectOption={(option) => {
            setDescripcion(option?.object.name);
            setPrecioUnitario(Number(option?.object.sellPrice));
            setDiasParaRecordatorio([]);
            setPdfName(option?.object.pdfName ?? "");
          }}
          initialValue={initialManoDeObra?.id.toString()}
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

export default TrabajoDeListaForm;
