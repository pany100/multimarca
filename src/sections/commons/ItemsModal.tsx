import useStockProveedores from "@/hooks/useStockProveedores";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import NonFormInput from "./NonFormInput";
import NonFormSelect from "./NonFormSelect";

type Props = {
  open: boolean;
  onClose: () => void;
  proveedorId?: number;
};

function ItemsModal({ open, onClose, proveedorId }: Props) {
  const { stockOptions } = useStockProveedores({ proveedorId });
  const { watch, setValue } = useFormContext();
  const [stock, setStock] = useState<{
    stockId: string;
    name: string;
  } | null>(null);
  const [cantidad, setCantidad] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onSubmit = () => {
    setError(null);
    const items = watch("items") || [];
    if (items.some((item: any) => item.stockId === Number(stock?.stockId))) {
      setError("El stock ya existe en la orden");
      return;
    }
    const newItem = {
      ...stock,
      cantidad: Number(cantidad),
    };
    const updatedItems = [...items, newItem];
    setValue("items", updatedItems);
    setStock(null);
    setCantidad(null);
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "400px",
          maxWidth: "100%",
        },
      }}
    >
      <DialogTitle>Agregar Nuevo Item</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <NonFormSelect
            options={stockOptions}
            onChange={(value: string) =>
              setStock({
                stockId: value,
                name: stockOptions.find((s) => s.value === value)?.name || "",
              })
            }
            label="Stock"
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <NonFormInput
            label="Cantidad"
            type="number"
            onChange={(value) => setCantidad(Number(value))}
          />
        </Box>
        {error && <Typography color="error">{error}</Typography>}
      </DialogContent>
      <DialogActions sx={{ mr: 2, mb: 2 }}>
        <Button
          onClick={() => {
            setStock(null);
            setCantidad(null);
            setError(null);
            onClose();
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={stock === null || cantidad === null || cantidad === 0}
        >
          Agregar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ItemsModal;
