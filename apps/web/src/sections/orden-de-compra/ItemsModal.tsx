import useStockItemData from "@/hooks/useStockItemData";
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
import NonFormInput from "../commons/NonFormInput";
import NonFormSelect from "../commons/NonFormSelect";

type Props = {
  open: boolean;
  onClose: () => void;
  proveedorId?: number;
};

function ItemsModal({ open, onClose, proveedorId }: Props) {
  const { stockOptions } = useStockProveedores({ proveedorId });
  const { onSubmit, setStock, setCantidad, error, submitDisabled, onCancel } =
    useStockItemData({
      onClose,
    });
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
