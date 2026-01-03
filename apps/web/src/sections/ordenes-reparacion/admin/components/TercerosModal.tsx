import ImageInput from "@/components/ImageInput";
import ORepObjectAutocomplete from "@/components/orden-reparacion/formV2/commons/inputs/ORepObjectAutocomplete";
import ORepTextField from "@/components/orden-reparacion/formV2/commons/inputs/ORepTextField";
import useReparacionTercerosObjectAutocomplete from "@/hooks/orden-reparacion/useReparacionTercerosObjectAutocomplete";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface Proveedor {
  id: number;
  name: string;
}

interface ReparacionTercero {
  id: number;
  nombre: string;
  precioCompra: number;
  precioVenta: number;
  proveedor: Proveedor;
  recibo?: string | null;
}

interface TercerosModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nombre: string;
    proveedorId: number;
    precioCompra: number;
    precioVenta: number;
    recibo?: string | null;
  }) => Promise<void>;
  loading?: boolean;
  editTercero?: ReparacionTercero;
}

const TercerosModal = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  editTercero,
}: TercerosModalProps) => {
  const { searchProveedores, initialProveedores } =
    useReparacionTercerosObjectAutocomplete();

  const [nombre, setNombre] = useState("");
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [precioCompra, setPrecioCompra] = useState<string>("");
  const [precioVenta, setPrecioVenta] = useState<string>("");
  const [recibo, setRecibo] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editTercero) {
        setNombre(editTercero.nombre);
        setProveedor(editTercero.proveedor);
        setPrecioCompra(editTercero.precioCompra.toString());
        setPrecioVenta(editTercero.precioVenta.toString());
        setRecibo(editTercero.recibo || null);
      } else {
        setNombre("");
        setProveedor(null);
        setPrecioCompra("");
        setPrecioVenta("");
        setRecibo(null);
      }
    }
  }, [open, editTercero]);

  const handleSubmit = async () => {
    if (!proveedor || !nombre || !precioCompra || !precioVenta) return;

    await onSubmit({
      nombre,
      proveedorId: proveedor.id,
      precioCompra: Number(precioCompra),
      precioVenta: Number(precioVenta),
      recibo,
    });
  };

  const isValid =
    nombre &&
    proveedor &&
    precioCompra !== "" &&
    precioVenta !== "" &&
    Number(precioCompra) >= 0 &&
    Number(precioVenta) >= 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editTercero
          ? "Editar Reparación de Tercero"
          : "Agregar Reparación de Tercero"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ pt: 1 }}>
          <Grid item xs={12}>
            <ORepObjectAutocomplete
              label="Proveedor"
              searchOptions={searchProveedores}
              initialOptions={initialProveedores}
              selectOption={(option) => {
                setProveedor(option?.object || null);
              }}
              initialValue={editTercero?.proveedor?.id.toString()}
            />
          </Grid>

          <Grid item xs={12}>
            <ORepTextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <ORepTextField
              label="Precio Compra"
              type="number"
              value={precioCompra}
              onChange={(e) => setPrecioCompra(e.target.value)}
              disabled={loading}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <ORepTextField
              label="Precio Venta"
              type="number"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
              disabled={loading}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Recibo
            </Typography>
            <Box sx={{ overflow: "hidden" }}>
              <ImageInput
                label=""
                image={recibo}
                setImage={(image: string | null) => setRecibo(image)}
              />
            </Box>
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
          {editTercero ? "Actualizar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TercerosModal;
