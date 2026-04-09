import { ModalProvider } from "@/contexts/ModalContext";
import TuneIcon from "@mui/icons-material/Tune";
import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useFormContext } from "react-hook-form";
import FormDataArrayWithModal from "../../commons/FormDataArray/FormDataWithModal";
import AjustePrecioInnerForm from "./AjustePrecioInnerForm";
import AjustesPrecioTableColumns from "./AjustesPrecioTableColumns";

function AjustesPrecioSection() {
  const { watch, setValue } = useFormContext();
  const modoAjustes = watch("modoAjustes") || "sobreTotalBase";

  const validateForm = (newItem: any) => {
    const errors: Record<string, string> = {};
    if (!newItem?.descripcion?.trim()) {
      errors.descripcion = "La descripcion es requerida";
    }
    if (!newItem?.monto || newItem.monto <= 0) {
      errors.monto = "El monto debe ser positivo";
    }
    if (!newItem?.tipo) {
      errors.tipo = "El tipo es requerido";
    }
    return Object.keys(errors).length > 0 ? errors : null;
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Incrementos y Descuentos
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Modo de aplicacion</InputLabel>
          <Select
            value={modoAjustes}
            label="Modo de aplicacion"
            onChange={(e) => setValue("modoAjustes", e.target.value)}
          >
            <MenuItem value="sobreTotalBase">Sobre el total base</MenuItem>
            <MenuItem value="acumulativo">Acumulativo</MenuItem>
          </Select>
          <FormHelperText>
            {modoAjustes === "sobreTotalBase"
              ? "Cada ajuste se calcula sobre el precio total original"
              : "Cada ajuste se aplica sobre el resultado del anterior"}
          </FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <ModalProvider>
          <FormDataArrayWithModal
            fieldName="ajustesPrecio"
            columns={AjustesPrecioTableColumns}
            form={AjustePrecioInnerForm}
            validateForm={validateForm}
          >
            <TuneIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
            <Typography color="textSecondary" gutterBottom>
              No hay incrementos o descuentos asignados
            </Typography>
          </FormDataArrayWithModal>
        </ModalProvider>
      </Grid>
    </Grid>
  );
}

export default AjustesPrecioSection;
