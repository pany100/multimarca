import ORepObjectAutocomplete from "@/components/orden-reparacion/formV2/commons/inputs/ORepObjectAutocomplete";
import ORepTextField from "@/components/orden-reparacion/formV2/commons/inputs/ORepTextField";
import useTrabajosObjectAutocomplete from "@/hooks/orden-reparacion/useTrabajosObjectAutocomplete";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface ManoDeObra {
  id: number;
  name: string;
  sellPrice: number;
}

interface TrabajoRealizado {
  id: number;
  precioUnitario: number;
  descripcion: string;
  diasParaRecordatorio?: number | null;
}

interface TrabajosModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    precioUnitario: number;
    descripcion: string;
    diasParaRecordatorio?: number | null;
    manoDeObra?: { name: string };
  }) => Promise<void>;
  loading?: boolean;
  editTrabajo?: TrabajoRealizado;
}

const TrabajosModal = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  editTrabajo,
}: TrabajosModalProps) => {
  const { searchTrabajo, initialTrabajo } = useTrabajosObjectAutocomplete();

  const [tipoTrabajo, setTipoTrabajo] = useState<"lista" | "otros">("lista");
  const [manoDeObra, setManoDeObra] = useState<ManoDeObra | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState<string>("");
  const [diasParaRecordatorio, setDiasParaRecordatorio] = useState<string>("");

  useEffect(() => {
    if (open) {
      if (editTrabajo) {
        setDescripcion(editTrabajo.descripcion);
        setPrecioUnitario(editTrabajo.precioUnitario.toString());
        setDiasParaRecordatorio(
          editTrabajo.diasParaRecordatorio?.toString() || ""
        );
        setTipoTrabajo("otros"); // Default to "Otros trabajos" for edit
      } else {
        setTipoTrabajo("lista");
        setManoDeObra(null);
        setDescripcion("");
        setPrecioUnitario("");
        setDiasParaRecordatorio("");
      }
    }
  }, [open, editTrabajo]);

  const handleSubmit = async () => {
    if (!precioUnitario) return;

    const data: any = {
      precioUnitario: Number(precioUnitario),
      diasParaRecordatorio: diasParaRecordatorio
        ? Number(diasParaRecordatorio)
        : null,
    };

    if (tipoTrabajo === "lista" && manoDeObra) {
      data.manoDeObra = { name: manoDeObra.name };
      data.descripcion = manoDeObra.name;
    } else {
      data.descripcion = descripcion;
    }

    await onSubmit(data);
  };

  const isValid =
    precioUnitario &&
    Number(precioUnitario) >= 0 &&
    (tipoTrabajo === "lista" ? manoDeObra : descripcion);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editTrabajo ? "Editar Trabajo Realizado" : "Agregar Trabajo Realizado"}
      </DialogTitle>
      <DialogContent>
        {!editTrabajo && (
          <Box sx={{ mb: 3, mt: 2 }}>
            <ToggleButtonGroup
              value={tipoTrabajo}
              exclusive
              onChange={(_, newTipoTrabajo: "lista" | "otros" | null) => {
                if (newTipoTrabajo !== null) {
                  setTipoTrabajo(newTipoTrabajo);
                  setManoDeObra(null);
                  setDescripcion("");
                  setPrecioUnitario("");
                  setDiasParaRecordatorio("");
                }
              }}
              aria-label="tipo de trabajo"
              fullWidth
              color="primary"
            >
              <ToggleButton value="lista" aria-label="trabajo de lista">
                Trabajo de Lista
              </ToggleButton>
              <ToggleButton value="otros" aria-label="otros trabajos">
                Otros Trabajos
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        <Grid container spacing={1}>
          {tipoTrabajo === "lista" && !editTrabajo ? (
            <>
              <Grid item xs={12} sx={{ mb: 1 }}>
                <ORepObjectAutocomplete
                  label="Trabajo"
                  searchOptions={searchTrabajo}
                  initialOptions={initialTrabajo}
                  selectOption={(option) => {
                    if (option) {
                      setManoDeObra(option.object);
                      setPrecioUnitario(option.object.sellPrice.toString());
                    } else {
                      setManoDeObra(null);
                      setPrecioUnitario("");
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sx={{ mb: 1 }}>
                <ORepTextField
                  label="Precio"
                  type="number"
                  value={precioUnitario}
                  onChange={(e) => setPrecioUnitario(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recordatorio (opcional)
                </Typography>
                <ORepTextField
                  label="Días para Recordatorio"
                  type="number"
                  value={diasParaRecordatorio}
                  onChange={(e) => setDiasParaRecordatorio(e.target.value)}
                  disabled={loading}
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sx={{ mb: 1 }}>
                <ORepTextField
                  label="Nombre del Trabajo"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sx={{ mb: 1 }}>
                <ORepTextField
                  label="Precio"
                  type="number"
                  value={precioUnitario}
                  onChange={(e) => setPrecioUnitario(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recordatorio (opcional)
                </Typography>
                <ORepTextField
                  label="Días para Recordatorio"
                  type="number"
                  value={diasParaRecordatorio}
                  onChange={(e) => setDiasParaRecordatorio(e.target.value)}
                  disabled={loading}
                />
              </Grid>
            </>
          )}
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
          {editTrabajo ? "Actualizar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrabajosModal;
