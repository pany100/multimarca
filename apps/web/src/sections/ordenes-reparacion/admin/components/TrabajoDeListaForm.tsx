import ORepObjectAutocomplete from "@/components/orden-reparacion/formV2/commons/inputs/ORepObjectAutocomplete";
import ORepTextField from "@/components/orden-reparacion/formV2/commons/inputs/ORepTextField";
import useTrabajosObjectAutocomplete from "@/hooks/orden-reparacion/useTrabajosObjectAutocomplete";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Grid, Typography } from "@mui/material";
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
    iva,
    setIva,
  } = useTrabajosContext();

  const precio = Number(precioUnitario) || 0;
  const ivaVal = Number(iva) || 0;
  const precioConIva =
    ivaVal > 0 ? Math.round(precio * (1 + ivaVal / 100)) : precio;

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
      <Grid item xs={6} sx={{ mb: 1 }}>
        <ORepTextField
          label="Precio Neto"
          type="number"
          value={precioUnitario || ""}
          onChange={(e) => setPrecioUnitario(Number(e.target.value))}
        />
      </Grid>
      <Grid item xs={6} sx={{ mb: 1 }}>
        <ORepTextField
          label="IVA (%)"
          type="number"
          value={iva ?? ""}
          onChange={(e) => setIva(Number(e.target.value) || null)}
        />
      </Grid>
      {precio > 0 && (
        <Grid item xs={12} sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Precio final con IVA: <strong>{getFormattedPrice(precioConIva)}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Precio final = Precio Neto × (1 + IVA/100), redondeado al entero más cercano. Si IVA es 0, el precio final es igual al precio neto.
          </Typography>
        </Grid>
      )}
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
