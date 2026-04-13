import ORepTextField from "@/components/orden-reparacion/formV2/commons/inputs/ORepTextField";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { AjustePrecio } from "../hooks/useAjustesPrecioManager";

interface AjustesPrecioModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    descripcion: string;
    monto: number;
    tipo: "porcentual" | "fijo";
    esDescuento: boolean;
    esInterno: boolean;
    orden: number;
  }) => Promise<boolean>;
  loading?: boolean;
  editAjuste?: AjustePrecio;
}

const AjustesPrecioModal = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  editAjuste,
}: AjustesPrecioModalProps) => {
  const [efecto, setEfecto] = useState<"incremento" | "descuento">(
    "incremento",
  );
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState<"porcentual" | "fijo">("fijo");
  const [esInterno, setEsInterno] = useState(false);

  useEffect(() => {
    if (open) {
      if (editAjuste) {
        setEfecto(editAjuste.esDescuento ? "descuento" : "incremento");
        setDescripcion(editAjuste.descripcion);
        setMonto(Number(editAjuste.monto).toString());
        setTipo(editAjuste.tipo);
        setEsInterno(editAjuste.esInterno);
      } else {
        setEfecto("incremento");
        setDescripcion("");
        setMonto("");
        setTipo("fijo");
        setEsInterno(false);
      }
    }
  }, [open, editAjuste]);

  const handleSubmit = async () => {
    if (!descripcion.trim() || !monto || Number(monto) <= 0) return;

    const success = await onSubmit({
      descripcion: descripcion.trim(),
      monto: Number(monto),
      tipo,
      esDescuento: efecto === "descuento",
      esInterno,
      orden: editAjuste?.orden ?? 0,
    });

    if (success) {
      onClose();
    }
  };

  const isValid =
    descripcion.trim() !== "" && monto !== "" && Number(monto) > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editAjuste ? "Editar ajuste de precio" : "Agregar ajuste de precio"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Efecto"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={efecto}
              onChange={(e) =>
                setEfecto(e.target.value as "incremento" | "descuento")
              }
              disabled={loading}
            >
              <MenuItem value="incremento">Incremento</MenuItem>
              <MenuItem value="descuento">Descuento</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <ORepTextField
              label="Descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={loading}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <ORepTextField
              label="Monto"
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              disabled={loading}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="Tipo"
              variant="outlined"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as "porcentual" | "fijo")}
              disabled={loading}
            >
              <MenuItem value="fijo">Fijo ($)</MenuItem>
              <MenuItem value="porcentual">Porcentual (%)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={esInterno}
                  onChange={(e) => setEsInterno(e.target.checked)}
                  disabled={loading}
                />
              }
              label="Oculto para el cliente"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ pl: 4, display: "block" }}
            >
              Si está oculto, este incremento va a mostrarse como parte del
              primer item de la mano de obra cuando se imprima el presupuesto
              para el cliente. Si no hay mano de obra, se suma al primer
              repuesto o reparación de terceros. Ejemplo: redondeo.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !isValid}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {editAjuste ? "Actualizar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AjustesPrecioModal;
