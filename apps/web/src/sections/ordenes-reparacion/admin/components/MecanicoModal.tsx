import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

interface Empleado {
  id: number;
  name: string;
}

interface MecanicoModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (mecanicoId: number, detalle: string) => Promise<void>;
  empleados: Empleado[];
  loading?: boolean;
  isEdit?: boolean;
  initialDetalle?: string;
}

const MecanicoModal = ({
  open,
  onClose,
  onSubmit,
  empleados,
  loading = false,
  isEdit = false,
  initialDetalle = "",
}: MecanicoModalProps) => {
  const [selectedMecanico, setSelectedMecanico] = useState<Empleado | null>(
    null
  );
  const [detalle, setDetalle] = useState(initialDetalle);

  useEffect(() => {
    if (open) {
      setDetalle(initialDetalle);
      if (!isEdit) {
        setSelectedMecanico(null);
      }
    }
  }, [open, initialDetalle, isEdit]);

  const handleSubmit = async () => {
    if (!isEdit && !selectedMecanico) return;

    await onSubmit(selectedMecanico?.id || 0, detalle);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? "Editar Detalle del Mecánico" : "Agregar Mecánico"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {!isEdit && (
            <Autocomplete
              options={empleados}
              getOptionLabel={(option) => option.name}
              value={selectedMecanico}
              onChange={(_, newValue) => setSelectedMecanico(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Mecánico"
                  required
                  disabled={loading}
                />
              )}
              disabled={loading}
            />
          )}
          <TextField
            label="Detalle del trabajo"
            multiline
            rows={4}
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            disabled={loading}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || (!isEdit && !selectedMecanico)}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {isEdit ? "Actualizar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MecanicoModal;
