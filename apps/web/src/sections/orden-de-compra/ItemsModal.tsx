import useStockItemData from "@/hooks/useStockItemData";
import useStockProveedores from "@/hooks/useStockProveedores";
import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import NonFormInput from "../commons/NonFormInput";
import NonFormSelect from "../commons/NonFormSelect";

type Props = {
  open: boolean;
  onClose: () => void;
  proveedorId?: number;
};

function ItemsModal({ open, onClose, proveedorId }: Props) {
  const { stockOptions } = useStockProveedores({ proveedorId });
  const {
    onSubmit,
    setStock,
    setCantidad,
    setPrecioUnitario,
    setIva,
    precioUnitario,
    iva,
    error,
    submitDisabled,
    onCancel,
  } = useStockItemData({
    onClose,
  });

  const precioConIva =
    precioUnitario != null
      ? precioUnitario * (1 + (Number(iva) || 0) / 100)
      : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "450px",
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
                label: stockOptions.find((s) => s.value === value)?.label || "",
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
        <Box sx={{ mb: 3 }}>
          <NonFormInput
            label="Precio Unitario (neto)"
            type="number"
            onChange={(value) => setPrecioUnitario(Number(value))}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <NonFormInput
            label="IVA %"
            type="number"
            onChange={(value) => setIva(Number(value))}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Precio con IVA"
            value={precioConIva ? getFormattedPrice(precioConIva) : ""}
            fullWidth
            disabled
            sx={{
              "& .MuiInputBase-root.Mui-disabled": {
                backgroundColor: "#f5f5f5",
              },
            }}
            helperText="Precio con IVA = Precio Unitario × (1 + IVA / 100)"
          />
        </Box>
        {error && <Typography color="error">{error}</Typography>}
      </DialogContent>
      <DialogActions sx={{ mr: 2, mb: 2 }}>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={submitDisabled}
        >
          Agregar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ItemsModal;
