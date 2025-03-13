import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import HandymanIcon from "@mui/icons-material/Handyman";
import ReceiptIcon from "@mui/icons-material/Receipt";
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
import Link from "next/link";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import ImageInput from "../ImageInput";

function ReparacionesTercerosFormSection({
  esBorrador = false,
}: {
  esBorrador?: boolean;
}) {
  const { control, getValues, setValue } = useFormContext();
  const { authFetch } = useFetch();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openReparacionModal, setOpenReparacionModal] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [proveedorOptions, setProveedorOptions] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [nombre, setNombre] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [editingReparacionId, setEditingReparacionId] = useState<string | null>(
    null
  );
  const [recibo, setRecibo] = useState<string | null>(null);

  const searchProveedores = async (query: string) => {
    const response = await authFetch(
      `/api/proveedores?query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    setProveedorOptions(
      data.items.map((proveedor: { name: string; id: number }) => ({
        id: proveedor.id,
        name: proveedor.name,
      }))
    );
  };

  const handleAddOrUpdateReparacion = () => {
    if (selectedProveedor) {
      const currentReparaciones = getValues("reparacionesDeTercero") || [];
      const newReparacion = {
        id: editingReparacionId || `${selectedProveedor.id}-${nombre}`,
        proveedor: selectedProveedor,
        nombre,
        precioCompra: Number(precioCompra),
        precioVenta: Number(precioVenta),
        recibo,
      };

      if (editingReparacionId) {
        const updatedReparaciones = currentReparaciones.map((r: any) =>
          r.id === editingReparacionId ||
          `${r.proveedor.id}-${r.nombre}` === editingReparacionId ||
          `${r.proveedor.id}-${r.nombre}` ===
            `${selectedProveedor.id}-${nombre}`
            ? newReparacion
            : r
        );
        setValue("reparacionesDeTercero", updatedReparaciones);
        setSnackbar({
          open: true,
          message: "Reparación actualizada correctamente",
          severity: "success",
        });
        resetFields();
      } else if (
        currentReparaciones.some((r: any) => r.id === newReparacion.id)
      ) {
        setSnackbar({
          open: true,
          message:
            "Ya existe una reparación con el mismo nombre para este proveedor",
          severity: "error",
        });
      } else {
        setValue("reparacionesDeTercero", [
          ...currentReparaciones,
          newReparacion,
        ]);
        resetFields();
        setSnackbar({
          open: true,
          message: "Reparación agregada correctamente",
          severity: "success",
        });
      }
    }
  };

  const handleEditReparacion = (reparacion: any) => {
    setSelectedProveedor(reparacion.proveedor);
    setNombre(reparacion.nombre);
    setRecibo(reparacion.recibo);
    setPrecioCompra(reparacion.precioCompra.toString());
    setPrecioVenta(reparacion.precioVenta.toString());
    setEditingReparacionId(
      reparacion.id || `${reparacion.proveedor.id}-${reparacion.nombre}`
    );

    setOpenReparacionModal(true);
  };

  const handleRemoveReparacion = (reparacion: any) => {
    const currentReparaciones = getValues("reparacionesDeTercero") || [];
    const updatedReparaciones = currentReparaciones.filter(
      (r: any) =>
        !(
          r.nombre === reparacion.nombre &&
          r.precioCompra === reparacion.precioCompra &&
          r.precioVenta === reparacion.precioVenta &&
          r.proveedor.id === reparacion.proveedor.id
        )
    );

    setValue("reparacionesDeTercero", updatedReparaciones);

    setSnackbar({
      open: true,
      message: `${reparacion.nombre} eliminado`,
      severity: "info",
    });
  };

  const resetFields = () => {
    setOpenReparacionModal(false);
    setSelectedProveedor(null);
    setNombre("");
    setRecibo(null);
    setPrecioCompra("");
    setPrecioVenta("");
    setEditingReparacionId(null);
  };

  const openAddModal = () => {
    setEditingReparacionId(null);
    setOpenReparacionModal(true);
  };

  return (
    <>
      <Controller
        name="reparacionesDeTercero"
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
                      <TableCell sx={{ color: "white" }}>Proveedor</TableCell>
                      <TableCell sx={{ color: "white" }}>Descripción</TableCell>
                      <TableCell sx={{ color: "white" }}>
                        Precio Compra
                      </TableCell>
                      <TableCell sx={{ color: "white" }}>
                        Precio Venta
                      </TableCell>
                      {!esBorrador && (
                        <TableCell sx={{ color: "white" }}>Recibo</TableCell>
                      )}
                      <TableCell sx={{ color: "white" }} align="right">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {field.value.map((reparacion: any) => (
                      <TableRow key={reparacion.id}>
                        <TableCell>
                          <strong>{reparacion.proveedor.name}</strong>
                        </TableCell>
                        <TableCell>{reparacion.nombre}</TableCell>
                        <TableCell>
                          {getFormattedPrice(reparacion.precioCompra)}
                        </TableCell>
                        <TableCell>
                          {getFormattedPrice(reparacion.precioVenta)}
                        </TableCell>
                        {!esBorrador && (
                          <TableCell>
                            {reparacion.recibo ? (
                              <Link href={reparacion.recibo} target="_blank">
                                <Button
                                  size="small"
                                  color="primary"
                                  startIcon={<ReceiptIcon />}
                                >
                                  Ver recibo
                                </Button>
                              </Link>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Sin recibo
                              </Typography>
                            )}
                          </TableCell>
                        )}
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleEditReparacion(reparacion)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => {
                                handleRemoveReparacion(reparacion);
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
                <HandymanIcon
                  sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                />
                <Typography color="textSecondary" gutterBottom>
                  No hay repuestos / reparaciones de terceros asignadas
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={openAddModal}
                  sx={{ mt: 1 }}
                >
                  Agregar Reparación / Repuesto
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
                  Agregar Reparación / Repuesto
                </Button>
              </Box>
            )}
          </>
        )}
      />

      <Dialog
        open={openReparacionModal}
        onClose={resetFields}
        PaperProps={{
          style: {
            width: "450px",
            maxWidth: "90vw",
          },
        }}
      >
        <DialogTitle>
          {editingReparacionId ? "Editar" : "Agregar"} Reparación de Tercero
        </DialogTitle>
        <DialogContent dividers>
          <Autocomplete
            options={proveedorOptions}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Proveedor"
                fullWidth
                variant="outlined"
                placeholder="Buscar proveedor..."
              />
            )}
            value={selectedProveedor}
            onChange={(_, newValue) => {
              setSelectedProveedor(newValue);
            }}
            onInputChange={(_, newInputValue) => {
              searchProveedores(newInputValue);
            }}
            disabled={!!editingReparacionId}
            noOptionsText="No se encontraron proveedores"
            loadingText="Buscando..."
            sx={{ mb: 3 }}
          />
          <TextField
            label="Descripción"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
            sx={{ mb: 2 }}
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
          {!esBorrador && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Recibo
              </Typography>
              <Box sx={{ overflow: "hidden" }}>
                <ImageInput label="" image={recibo} setImage={setRecibo} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={resetFields}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleAddOrUpdateReparacion}
            disabled={
              !selectedProveedor ||
              !nombre ||
              (!esBorrador && (!precioCompra || !precioVenta))
            }
            color="primary"
          >
            {editingReparacionId ? "Guardar Cambios" : "Agregar"}
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

export default ReparacionesTercerosFormSection;
