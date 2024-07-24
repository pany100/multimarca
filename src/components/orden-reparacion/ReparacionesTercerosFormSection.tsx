import authFetch from "@/utils/authFetch";
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

function ReparacionesTercerosFormSection() {
  const { control, getValues, setValue } = useFormContext();

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

  const handleAddReparacion = () => {
    if (selectedProveedor) {
      const currentReparaciones = getValues("reparacionesDeTercero") || [];
      const newReparacion = {
        proveedor: selectedProveedor,
        nombre,
        precioCompra: Number(precioCompra),
        precioVenta: Number(precioVenta),
      };

      if (
        currentReparaciones.some(
          (r: any) =>
            r.nombre === nombre && r.proveedor.id === selectedProveedor.id
        )
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
        setSelectedProveedor(null);
        setNombre("");
        setPrecioCompra("");
        setPrecioVenta("");
        setSnackbar({
          open: true,
          message: "Reparación agregada correctamente",
          severity: "success",
        });
      }
    }
  };

  const handleRemoveReparacion = (nombre: string, proveedorId: number) => {
    const currentReparaciones = getValues("reparacionesDeTercero") || [];
    const updatedReparaciones = currentReparaciones.filter(
      (r: any) => !(r.nombre === nombre && r.proveedor.id === proveedorId)
    );

    setValue("reparacionesDeTercero", updatedReparaciones);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Reparaciones de Terceros
      </Typography>
      <Controller
        name="reparacionesDeTercero"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Precio Compra</TableCell>
                  <TableCell>Precio Venta</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {field.value?.map((reparacion: any) => (
                  <TableRow
                    key={`${reparacion.nombre}-${reparacion.proveedor.id}`}
                  >
                    <TableCell>{reparacion.proveedor.name}</TableCell>
                    <TableCell>{reparacion.nombre}</TableCell>
                    <TableCell>{reparacion.precioCompra}</TableCell>
                    <TableCell>{reparacion.precioVenta}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          handleRemoveReparacion(
                            reparacion.nombre,
                            reparacion.proveedor.id
                          );
                        }}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {error && <Typography color="error">{error.message}</Typography>}
            <Button
              onClick={() => setOpenReparacionModal(true)}
              variant="contained"
              color="secondary"
            >
              Agregar Reparación
            </Button>
          </>
        )}
      />
      <Dialog
        open={openReparacionModal}
        onClose={() => setOpenReparacionModal(false)}
      >
        <DialogTitle>Agregar Reparación de Tercero</DialogTitle>
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
          />
          <TextField
            label="Nombre"
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
          <Button type="button" onClick={() => setOpenReparacionModal(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAddReparacion}
            disabled={
              !selectedProveedor || !nombre || !precioCompra || !precioVenta
            }
          >
            Agregar
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
    </>
  );
}

export default ReparacionesTercerosFormSection;
