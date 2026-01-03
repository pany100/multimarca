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
  Tab,
  Tabs,
  TextField,
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

  const [tabValue, setTabValue] = useState(0);
  const [manoDeObra, setManoDeObra] = useState<ManoDeObra | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState<string>("");
  const [diasParaRecordatorio, setDiasParaRecordatorio] = useState<string>("");

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState("");
  const [trabajosOptions, setTrabajosOptions] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    if (open) {
      if (editTrabajo) {
        setDescripcion(editTrabajo.descripcion);
        setPrecioUnitario(editTrabajo.precioUnitario.toString());
        setDiasParaRecordatorio(
          editTrabajo.diasParaRecordatorio?.toString() || ""
        );
        // Determine tab based on whether it's from lista or not
        setTabValue(1); // Default to "Otros trabajos" for edit
      } else {
        setTabValue(0);
        setManoDeObra(null);
        setDescripcion("");
        setPrecioUnitario("");
        setDiasParaRecordatorio("");
        setSearchQuery("");
      }
    }
  }, [open, editTrabajo]);

  useEffect(() => {
    const loadInitialOptions = async () => {
      const results = await searchTrabajo("");
      setTrabajosOptions(results);
    };
    if (open && tabValue === 0) {
      loadInitialOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tabValue]);

  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      setLoadingSearch(true);
      const results = await searchTrabajo(value);
      setTrabajosOptions(results);
      setLoadingSearch(false);
    }
  };

  const handleTrabajoSelect = (trabajo: any) => {
    setManoDeObra(trabajo.object);
    setDescripcion(trabajo.object.name);
    setPrecioUnitario(trabajo.object.sellPrice.toString());
  };

  const handleSubmit = async () => {
    if (!descripcion || !precioUnitario) return;

    await onSubmit({
      descripcion,
      precioUnitario: Number(precioUnitario),
      diasParaRecordatorio: diasParaRecordatorio
        ? Number(diasParaRecordatorio)
        : null,
    });
  };

  const isValid = descripcion && precioUnitario && Number(precioUnitario) >= 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editTrabajo ? "Editar Trabajo Realizado" : "Agregar Trabajo Realizado"}
      </DialogTitle>
      <DialogContent>
        {!editTrabajo && (
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ mb: 2, mt: 1 }}
          >
            <Tab label="Trabajo de Lista" />
            <Tab label="Otros Trabajos" />
          </Tabs>
        )}

        <Grid container spacing={2} sx={{ pt: 1 }}>
          {tabValue === 0 && !editTrabajo ? (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Buscar trabajo"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  disabled={loading}
                />
                {loadingSearch && <CircularProgress size={20} sx={{ mt: 1 }} />}
                {trabajosOptions.length > 0 && searchQuery && (
                  <Box sx={{ mt: 1, maxHeight: 200, overflow: "auto" }}>
                    {trabajosOptions.map((option) => (
                      <Box
                        key={option.object.id}
                        sx={{
                          p: 1,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={() => {
                          handleTrabajoSelect(option);
                          setSearchQuery(option.object.name);
                        }}
                      >
                        {option.object.name} - ${option.object.sellPrice}
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>
            </>
          ) : null}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción del Trabajo"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={loading || (tabValue === 0 && !!manoDeObra)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Precio"
              type="number"
              value={precioUnitario}
              onChange={(e) => setPrecioUnitario(e.target.value)}
              disabled={loading}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Días para Recordatorio (opcional)"
              type="number"
              value={diasParaRecordatorio}
              onChange={(e) => setDiasParaRecordatorio(e.target.value)}
              disabled={loading}
            />
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
          {editTrabajo ? "Actualizar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrabajosModal;
