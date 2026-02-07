import ORepObjectAutocomplete from "@/components/orden-reparacion/formV2/commons/inputs/ORepObjectAutocomplete";
import ORepTextField from "@/components/orden-reparacion/formV2/commons/inputs/ORepTextField";
import useStockObjectAutocomplete from "@/hooks/orden-reparacion/useStockObjectAutocomplete";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";

interface Stock {
  id: number;
  nombre: string;
  fraccionable?: boolean;
}

interface RepuestoUsado {
  id: number;
  stockId: number;
  precioCompra: number;
  precioVenta: number;
  unidadesConsumidas: number;
  stock: Stock;
}

interface RepuestosModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    stockId: number;
    precioCompra: number;
    precioVenta: number;
    unidadesConsumidas: number; // entero o decimal si el ítem es fraccionable
  }) => Promise<boolean>;
  loading?: boolean;
  editRepuesto?: RepuestoUsado;
}

const RepuestosModal = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  editRepuesto,
}: RepuestosModalProps) => {
  const { searchStockObject, initialStock } = useStockObjectAutocomplete();

  const [stock, setStock] = useState<Stock | null>(null);
  const [precioCompra, setPrecioCompra] = useState<string>("");
  const [precioVenta, setPrecioVenta] = useState<string>("");
  const [precioUnitario, setPrecioUnitario] = useState<string>("");
  const [unidadesConsumidas, setUnidadesConsumidas] = useState<string>("");

  useEffect(() => {
    if (open) {
      if (editRepuesto) {
        setStock(editRepuesto.stock);
        setPrecioCompra(editRepuesto.precioCompra.toString());
        setPrecioVenta(editRepuesto.precioVenta.toString());
        setUnidadesConsumidas(
          String(
            typeof editRepuesto.unidadesConsumidas === "number"
              ? editRepuesto.unidadesConsumidas
              : Number(editRepuesto.unidadesConsumidas),
          ),
        );
        const u = Number(editRepuesto.unidadesConsumidas) || 1;
        const unitPrice = (editRepuesto.precioVenta / u).toFixed(2);
        setPrecioUnitario(unitPrice);
      } else {
        setStock(null);
        setPrecioCompra("");
        setPrecioVenta("");
        setPrecioUnitario("");
        setUnidadesConsumidas("");
      }
    }
  }, [open, editRepuesto]);

  const handleSubmit = async () => {
    if (!stock || !precioCompra || !precioVenta || !unidadesConsumidas) return;

    await onSubmit({
      stockId: stock.id,
      precioCompra: Number(precioCompra),
      precioVenta: Number(precioVenta),
      unidadesConsumidas: Number(unidadesConsumidas),
    });
  };

  const handlePrecioUnitarioChange = (value: string) => {
    if (value === "") {
      setPrecioUnitario("");
      setPrecioVenta("");
    } else {
      const unitPrice = Number(value);
      setPrecioUnitario(value);
      const units = Number(unidadesConsumidas) || 1;
      setPrecioVenta((unitPrice * units).toString());
    }
  };

  const handleUnidadesChange = (value: string) => {
    if (value === "") {
      setUnidadesConsumidas("");
    } else {
      const units = Number(value);
      setUnidadesConsumidas(value);
      const unitPrice = Number(precioUnitario) || 0;
      setPrecioVenta((unitPrice * units).toString());
    }
  };

  const handlePrecioVentaChange = (value: string) => {
    if (value === "") {
      setPrecioVenta("");
      setPrecioUnitario("");
    } else {
      const salePrice = Number(value);
      setPrecioVenta(value);
      const units = Number(unidadesConsumidas) || 1;
      setPrecioUnitario(Math.ceil(salePrice / units).toString());
    }
  };

  const isValid =
    stock &&
    precioCompra !== "" &&
    precioVenta !== "" &&
    unidadesConsumidas !== "" &&
    Number(precioCompra) >= 0 &&
    Number(precioVenta) >= 0 &&
    Number(unidadesConsumidas) > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editRepuesto ? "Editar Repuesto Usado" : "Agregar Repuesto Usado"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ pt: 1 }}>
          <Grid item xs={12}>
            <ORepObjectAutocomplete
              label="Repuesto"
              searchOptions={searchStockObject}
              initialOptions={initialStock}
              selectOption={(option) => {
                const precioVentaCalculado = Math.ceil(
                  option?.object?.buyPrice *
                    (1 + (option?.object?.markup || 0) / 100) || 0,
                );
                setStock(option?.object || null);
                setPrecioCompra(option?.object?.buyPrice?.toString() ?? "");
                setPrecioUnitario(precioVentaCalculado.toString());
                setUnidadesConsumidas("1");
                setPrecioVenta(precioVentaCalculado.toString());
              }}
              initialValue={editRepuesto?.stock?.id.toString()}
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
              label="Precio Unitario"
              type="number"
              value={precioUnitario}
              onChange={(e) => handlePrecioUnitarioChange(e.target.value)}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <ORepTextField
              label={
                stock?.fraccionable
                  ? "Litros consumidos"
                  : "Unidades consumidas"
              }
              type="number"
              value={unidadesConsumidas}
              onChange={(e) => handleUnidadesChange(e.target.value)}
              disabled={loading}
              required
              inputProps={{
                min: 0,
                step: stock?.fraccionable ? 0.1 : 1,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <ORepTextField
              label="Precio Venta"
              type="number"
              value={precioVenta}
              onChange={(e) => handlePrecioVentaChange(e.target.value)}
              disabled={loading}
              required
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
          {editRepuesto ? "Actualizar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RepuestosModal;
