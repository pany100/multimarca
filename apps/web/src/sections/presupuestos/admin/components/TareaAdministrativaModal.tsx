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

interface Usuario {
  id: number;
  fullName: string;
}

interface TareaAdministrativaModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (usuarioId: number, descripcion: string) => Promise<void>;
  usuarios: Usuario[];
  loading?: boolean;
  isEdit?: boolean;
  initialDescripcion?: string;
  initialUsuarioId?: number;
}

const TareaAdministrativaModal = ({
  open,
  onClose,
  onSubmit,
  usuarios,
  loading = false,
  isEdit = false,
  initialDescripcion = "",
  initialUsuarioId,
}: TareaAdministrativaModalProps) => {
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [descripcion, setDescripcion] = useState(initialDescripcion);

  useEffect(() => {
    if (open) {
      setDescripcion(initialDescripcion);
      if (!isEdit) {
        setSelectedUsuario(null);
      } else if (initialUsuarioId) {
        const usuario = usuarios.find((u) => u.id === initialUsuarioId);
        setSelectedUsuario(usuario || null);
      }
    }
  }, [open, initialDescripcion, isEdit, initialUsuarioId, usuarios]);

  const handleSubmit = async () => {
    if (!selectedUsuario) return;

    await onSubmit(selectedUsuario.id, descripcion);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? "Editar Tarea Administrativa" : "Agregar Tarea Administrativa"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Autocomplete
            options={usuarios}
            getOptionLabel={(option) => option.fullName}
            value={selectedUsuario}
            onChange={(_, newValue) => setSelectedUsuario(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Usuario Asignado"
                required
                disabled={loading}
              />
            )}
            disabled={loading}
          />
          <TextField
            label="Descripción de la tarea"
            multiline
            rows={4}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            disabled={loading}
            fullWidth
            required
            spellCheck
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
          disabled={loading || !selectedUsuario || !descripcion.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {isEdit ? "Actualizar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TareaAdministrativaModal;
