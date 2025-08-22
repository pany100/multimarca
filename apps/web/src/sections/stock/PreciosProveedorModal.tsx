import { useFetch } from "@/contexts/FetchContext";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  Modal,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

function PreciosProveedorModal({
  setRefreshTrigger,
}: {
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { authFetch } = useFetch();
  const [openModal, setOpenModal] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [porcentajeAumento, setPorcentajeAumento] = useState("");
  const [proveedorOptions, setProveedorOptions] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleUpdatePrices = async () => {
    if (!selectedProveedor || !porcentajeAumento) return;

    try {
      const response = await authFetch("/api/stock/update-by-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proveedorId: selectedProveedor.id,
          porcentajeAumento: parseFloat(porcentajeAumento),
        }),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Precios actualizados con éxito",
          severity: "success",
        });
        setOpenModal(false);
        if (setRefreshTrigger) {
          setRefreshTrigger((prev) => prev + 1);
        }
      } else {
        setSnackbar({
          open: true,
          message: "Error al actualizar precios",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({
        open: true,
        message: "Error al actualizar precios",
        severity: "error",
      });
    }
  };

  return (
    <Box>
      <Box sx={{ width: "100%", mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
          color="primary"
        >
          Actualizar precio por proveedor
        </Button>
      </Box>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Actualizar precio por proveedor
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Buscar proveedor y poner el % de aumento que se le va a aplicar a
            todos los repuestos provenientes del mismo
          </Typography>
          <Grid container>
            <Grid item xs={12}>
              <Autocomplete
                options={proveedorOptions}
                getOptionLabel={(option: { name: string; id: number }) =>
                  option.name
                }
                renderInput={(params) => (
                  <TextField {...params} label="Proveedor" />
                )}
                onChange={(_, newValue) =>
                  setSelectedProveedor(
                    newValue ? { id: newValue.id, name: newValue.name } : null
                  )
                }
                sx={{ mt: 2 }}
                onInputChange={(_, newInputValue) => {
                  if (newInputValue) {
                    authFetch(
                      `/api/proveedores?query=${newInputValue}&limit=10&page=0`
                    )
                      .then((response) => response.json())
                      .then((data) => {
                        const options = data.items.map(
                          (proveedor: { name: string; id: number }) => ({
                            id: proveedor.id,
                            name: proveedor.name,
                          })
                        );
                        setProveedorOptions(options);
                      });
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Porcentaje de aumento"
                type="number"
                value={porcentajeAumento}
                onChange={(e) => setPorcentajeAumento(e.target.value)}
                sx={{ mt: 2, width: "100%" }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button onClick={() => setOpenModal(false)} variant="outlined">
              Descartar
            </Button>
            <Button
              onClick={handleUpdatePrices}
              variant="contained"
              disabled={!selectedProveedor || !porcentajeAumento}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PreciosProveedorModal;
