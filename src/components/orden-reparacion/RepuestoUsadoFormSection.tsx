import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InventoryIcon from "@mui/icons-material/Inventory";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

function RepuestoUsadoFormSection({
  esBorrador = false,
}: {
  esBorrador?: boolean;
}) {
  const { control, getValues, setValue } = useFormContext();
  const [editingRepuestoId, setEditingRepuestoId] = useState<number | null>(
    null
  );

  const { authFetch } = useFetch();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openRepuestoModal, setOpenRepuestoModal] = useState(false);
  const [selectedRepuesto, setSelectedRepuesto] = useState<{
    id: number;
    name: string;
    buyPrice: number;
    markup: number;
  } | null>(null);
  const [repuestoOptions, setRepuestoOptions] = useState<
    Array<{ id: number; name: string; buyPrice: number; markup: number }>
  >([]);
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [unidadesConsumidas, setUnidadesConsumidas] = useState("");

  const handleEditRepuesto = (repuesto: any) => {
    setSelectedRepuesto(repuesto.stock);
    setPrecioCompra(repuesto.precioCompra.toString());
    setPrecioVenta(repuesto.precioVenta.toString());
    setUnidadesConsumidas(repuesto.unidadesConsumidas.toString());
    setEditingRepuestoId(repuesto.stock.id);
    setOpenRepuestoModal(true);
  };

  const searchRepuestos = async (query: string) => {
    const response = await authFetch(
      `/api/stock?query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    setRepuestoOptions(
      data.items.map(
        (repuesto: {
          name: string;
          id: number;
          buyPrice: number;
          markup: number;
        }) => ({
          id: repuesto.id,
          name: repuesto.name,
          buyPrice: repuesto.buyPrice,
          markup: repuesto.markup,
        })
      )
    );
  };

  const handleAddOrUpdateRepuesto = () => {
    if (selectedRepuesto) {
      const currentRepuestos = getValues("repuestosUsados") || [];
      const newRepuesto = {
        stock: selectedRepuesto,
        precioCompra: Number(precioCompra),
        precioVenta: Number(precioVenta),
        unidadesConsumidas: Number(unidadesConsumidas),
      };
      if (editingRepuestoId) {
        const updatedRepuestos = currentRepuestos.map((r: any) =>
          r.stock.id === editingRepuestoId ? newRepuesto : r
        );
        setValue("repuestosUsados", updatedRepuestos);
        setSnackbar({
          open: true,
          message: "Repuesto actualizado correctamente",
          severity: "success",
        });
        resetModal();
      } else if (
        currentRepuestos.some((r: any) => r.stock.id === selectedRepuesto.id)
      ) {
        setSnackbar({
          open: true,
          message: "Este repuesto ya ha sido agregado al formulario",
          severity: "error",
        });
      } else {
        setValue("repuestosUsados", [...currentRepuestos, newRepuesto]);
        resetModal();
        setSnackbar({
          open: true,
          message: "Repuesto agregado correctamente",
          severity: "success",
        });
      }
    }
  };

  const handleRemoveRepuesto = (id: number) => {
    const currentRepuestos = getValues("repuestosUsados") || [];
    const repuestoToRemove = currentRepuestos.find(
      (r: any) => r.stock.id === id
    );
    const updatedRepuestos = currentRepuestos.filter(
      (r: any) => r.stock.id !== id
    );

    setValue("repuestosUsados", updatedRepuestos);

    setSnackbar({
      open: true,
      message: repuestoToRemove
        ? `${repuestoToRemove.stock.name} eliminado`
        : "Repuesto eliminado",
      severity: "info",
    });
  };

  const resetModal = () => {
    setOpenRepuestoModal(false);
    setSelectedRepuesto(null);
    setPrecioCompra("");
    setPrecioVenta("");
    setUnidadesConsumidas("");
    setEditingRepuestoId(null);
  };

  const openAddModal = () => {
    setEditingRepuestoId(null);
    setOpenRepuestoModal(true);
  };

  return (
    <>
      <Controller
        name="repuestosUsados"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            {field.value && field.value.length > 0 ? (
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mb: 2 }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: "primary.light" }}>
                    <TableRow>
                      <TableCell sx={{ color: "white" }}>Repuesto</TableCell>
                      <TableCell sx={{ color: "white" }}>
                        Precio Compra
                      </TableCell>
                      <TableCell sx={{ color: "white" }}>
                        Precio Venta
                      </TableCell>
                      <TableCell sx={{ color: "white" }}>
                        Unidades Consumidas
                      </TableCell>
                      <TableCell sx={{ color: "white" }} align="right">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {field.value.map((repuesto: any) => (
                      <TableRow key={repuesto.stock.id}>
                        <TableCell>
                          <strong>{repuesto.stock.name}</strong>
                        </TableCell>
                        <TableCell>
                          {getFormattedPrice(repuesto.precioCompra)}
                        </TableCell>
                        <TableCell>
                          {getFormattedPrice(repuesto.precioVenta)}
                        </TableCell>
                        <TableCell>{repuesto.unidadesConsumidas}</TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleEditRepuesto(repuesto)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => {
                                handleRemoveRepuesto(repuesto.stock.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                sx={{
                  p: 3,
                  textAlign: "center",
                  border: "1px dashed #ccc",
                  borderRadius: 1,
                  mb: 2,
                  backgroundColor: "action.hover",
                }}
              >
                <InventoryIcon
                  sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                />
                <Typography color="textSecondary" gutterBottom>
                  No hay repuestos asignados
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={openAddModal}
                  sx={{ mt: 1 }}
                >
                  Agregar Repuesto
                </Button>
              </Box>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error.message}
              </Alert>
            )}
            {field.value && field.value.length > 0 && (
              <Box display="flex" justifyContent="flex-end">
                <Button
                  onClick={openAddModal}
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                >
                  Agregar Repuesto
                </Button>
              </Box>
            )}
          </>
        )}
      />

      <Dialog
        open={openRepuestoModal}
        onClose={resetModal}
        PaperProps={{
          style: {
            width: "450px",
            maxWidth: "90vw",
          },
        }}
      >
        <DialogTitle>
          {editingRepuestoId ? "Editar Repuesto" : "Agregar Repuesto"}
        </DialogTitle>
        <DialogContent dividers>
          <Autocomplete
            options={repuestoOptions}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Repuesto"
                fullWidth
                variant="outlined"
                placeholder="Buscar repuesto..."
              />
            )}
            value={selectedRepuesto}
            onChange={(_, newValue) => {
              setSelectedRepuesto(newValue);
              if (newValue) {
                setPrecioCompra(newValue.buyPrice.toString());
                const precioVentaCalculado =
                  newValue.buyPrice * (1 + (newValue.markup || 0) / 100);
                setPrecioVenta(precioVentaCalculado.toFixed(2));
              } else {
                setPrecioCompra("");
                setPrecioVenta("");
              }
            }}
            onInputChange={(_, newInputValue) => {
              searchRepuestos(newInputValue);
            }}
            disabled={!!editingRepuestoId}
            noOptionsText="No se encontraron repuestos"
            loadingText="Buscando..."
            sx={{ mb: 3 }}
          />
          <TextField
            label="Precio Compra"
            type="number"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Precio Venta"
            type="number"
            value={precioVenta}
            onChange={(e) => setPrecioVenta(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Unidades Consumidas"
            type="number"
            value={unidadesConsumidas}
            onChange={(e) => setUnidadesConsumidas(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={resetModal}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleAddOrUpdateRepuesto}
            disabled={
              !selectedRepuesto ||
              (!esBorrador && (!precioCompra || !precioVenta)) ||
              !unidadesConsumidas
            }
            color="primary"
          >
            {editingRepuestoId ? "Guardar Cambios" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={
            snackbar.severity as "success" | "error" | "warning" | "info"
          }
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default RepuestoUsadoFormSection;
