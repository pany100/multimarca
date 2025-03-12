"use client";

import { useFetch } from "@/contexts/FetchContext";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Template {
  id: number;
  nombre: string;
}

type Props = {
  open: boolean;
  onClose: () => void;
};

const AddPresupuestoModal = ({ open, onClose }: Props) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const router = useRouter();
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await authFetch("/api/plantilla-presupuesto");
        const data = await response.json();
        setTemplates(data.items);
      } catch (error) {
        console.error("Error al cargar los templates:", error);
      }
    };

    fetchTemplates();
  }, [authFetch]);

  const handleAddTemplateBlank = () => {
    router.push("/dashboard/presupuestos/nuevo");
    onClose();
  };

  const handleTemplateChange = (event: SelectChangeEvent<number | null>) => {
    const templateId = event.target.value as number | null;
    setSelectedTemplate(templateId);
  };

  const handleAddWithTemplate = () => {
    if (selectedTemplate) {
      router.push(
        `/dashboard/presupuestos/nuevo?templateId=${selectedTemplate}`
      );
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Crear Nuevo Presupuesto</DialogTitle>
      <DialogContent>
        <Typography>
          Seleccione una opción para agregar un nuevo presupuesto:
        </Typography>
        <Button
          onClick={handleAddTemplateBlank}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, mb: 2 }}
        >
          En Blanco
        </Button>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Seleccionar Template</InputLabel>
          <Select
            labelId="template-select-label"
            value={selectedTemplate || ""}
            fullWidth
            onChange={handleTemplateChange}
            label="Seleccionar Template"
          >
            <MenuItem value="">Ninguno</MenuItem>
            {templates.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                {template.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 2, px: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ mr: 1 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleAddWithTemplate}
          variant="contained"
          disabled={!selectedTemplate}
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPresupuestoModal;
