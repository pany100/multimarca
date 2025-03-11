import useStockAutocomplete from "@/hooks/useStockAutocomplete";
import useStockItemData from "@/hooks/useStockItemData";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import NonFormAutocomplete from "../commons/NonFormAutocomplete";
import NonFormInput from "../commons/NonFormInput";

type Props = {
  open: boolean;
  onClose: () => void;
};

function VentasItemsModal({ open, onClose }: Props) {
  const { searchStock } = useStockAutocomplete();
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
          <NonFormAutocomplete
            label="Stock"
            searchOptions={searchStock}
            selectOption={(option) => {
              if (option) {
                setStock({
                  stockId: option.value as string,
                  name: option.label,
                });
              }
            }}
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

export default VentasItemsModal;
