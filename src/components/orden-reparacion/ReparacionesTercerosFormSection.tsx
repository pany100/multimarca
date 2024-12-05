import { useFetch } from "@/contexts/FetchContext";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

function ReparacionesTercerosFormSection({
  esBorrador,
}: {
  esBorrador: boolean;
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
      };

      if (editingReparacionId) {
        const updatedReparaciones = currentReparaciones.map((r: any) =>
          r.id === editingReparacionId ||
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
        setOpenReparacionModal(false);
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
        setOpenReparacionModal(false);
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
    setPrecioCompra(reparacion.precioCompra.toString());
    setPrecioVenta(reparacion.precioVenta.toString());
    setEditingReparacionId(
      reparacion.id || `${reparacion.proveedor.id}-${reparacion.nombre}`
    );

    setOpenReparacionModal(true);
  };

  const handleRemoveReparacion = (id: string) => {
    const currentReparaciones = getValues("reparacionesDeTercero") || [];
    const updatedReparaciones = currentReparaciones.filter(
      (r: any) => r.id !== id
    );

    setValue("reparacionesDeTercero", updatedReparaciones);
  };

  const resetFields = () => {
    setSelectedProveedor(null);
    setNombre("");
    setPrecioCompra("");
    setPrecioVenta("");
    setEditingReparacionId(null);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Reparación / Repuestos de terceros
      </Typography>
      <Controller
        name="reparacionesDeTercero"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            {field.value && field.value.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Proveedor</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Precio Compra</TableCell>
                    <TableCell>Precio Venta</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {field.value.map((reparacion: any) => (
                    <TableRow key={reparacion.id}>
                      <TableCell>{reparacion.proveedor.name}</TableCell>
                      <TableCell>{reparacion.nombre}</TableCell>
                      <TableCell>{reparacion.precioCompra}</TableCell>
                      <TableCell>{reparacion.precioVenta}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleEditReparacion(reparacion)}
                        >
                          Editar
                        </Button>
                        <Button
                          onClick={() => {
                            handleRemoveReparacion(reparacion.id);
                          }}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography>
                No hay repuestos / reparaciones de terceros asignadas
              </Typography>
            )}
            {error && <Typography color="error">{error.message}</Typography>}
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                onClick={() => setOpenReparacionModal(true)}
                variant="contained"
              >
                Agregar Reparación / Repuesto
              </Button>
            </Box>
          </>
        )}
      />
      <Dialog
        open={openReparacionModal}
        onClose={() => {
          setOpenReparacionModal(false);
          resetFields();
        }}
        PaperProps={{
          style: {
            minWidth: "350px",
          },
        }}
      >
        <DialogTitle>
          {editingReparacionId ? "Editar" : "Agregar"} Reparación de Tercero
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            options={proveedorOptions}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField {...params} label="Proveedor" />
            )}
            value={selectedProveedor}
            onChange={(_, newValue) => {
              setSelectedProveedor(newValue);
            }}
            onInputChange={(_, newInputValue) => {
              searchProveedores(newInputValue);
            }}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Descripción"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Precio Compra"
            type="number"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Precio Venta"
            type="number"
            value={precioVenta}
            onChange={(e) => setPrecioVenta(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            onClick={() => {
              setOpenReparacionModal(false);
              resetFields();
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAddOrUpdateReparacion}
            disabled={
              !selectedProveedor ||
              !nombre ||
              (!esBorrador && (!precioCompra || !precioVenta))
            }
          >
            {editingReparacionId ? "Actualizar" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as "success" | "error" | "warning"}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Divider sx={{ mt: 2 }} />
    </>
  );
}

export default ReparacionesTercerosFormSection;
