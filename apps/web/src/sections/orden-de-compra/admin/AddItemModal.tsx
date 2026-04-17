"use client";

import useStockProveedores from "@/hooks/useStockProveedores";
import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface StockOption {
  value: string;
  label: string;
  name: string;
}

interface EditingItem {
  id: number;
  stockId: number;
  stockName: string;
  cantidad: number;
  precioUnitario: number | null;
  iva: number | null;
}

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  proveedorId: number;
  existingStockIds: number[];
  onAddItem: (data: {
    stockId: number;
    cantidad: number;
    precioUnitario: number | null;
    iva: number | null;
  }) => Promise<boolean>;
  onEditItem?: (
    itemId: number,
    data: {
      stockId?: number;
      cantidad: number;
      precioUnitario: number | null;
      iva: number | null;
    },
  ) => Promise<boolean>;
  editingItem?: EditingItem | null;
}

function AddItemModal({
  open,
  onClose,
  proveedorId,
  existingStockIds,
  onAddItem,
  onEditItem,
  editingItem,
}: AddItemModalProps) {
  const isEditing = !!editingItem;
  const { stockOptions } = useStockProveedores({ proveedorId });
  const [selectedStock, setSelectedStock] = useState<StockOption | null>(null);
  const [cantidad, setCantidad] = useState<string>("");
  const [precioUnitario, setPrecioUnitario] = useState<string>("");
  const [iva, setIva] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Precargar datos al editar
  useEffect(() => {
    if (editingItem && open) {
      // Buscar la opción de stock que corresponde
      const stockOption = stockOptions.find(
        (s) => String(s.value) === String(editingItem.stockId),
      );
      setSelectedStock(
        stockOption || {
          value: String(editingItem.stockId),
          label: "",
          name: editingItem.stockName,
        },
      );
      setCantidad(String(editingItem.cantidad));
      setPrecioUnitario(
        editingItem.precioUnitario != null
          ? String(editingItem.precioUnitario)
          : "",
      );
      setIva(editingItem.iva != null ? String(editingItem.iva) : "");
    }
  }, [editingItem, open, stockOptions]);

  const cantidadNum = Number(cantidad) || 0;
  const precioUnitarioNum =
    precioUnitario !== "" ? Number(precioUnitario) : null;
  const ivaNum = iva !== "" ? Number(iva) : null;

  const submitDisabled =
    selectedStock === null ||
    cantidadNum === 0 ||
    precioUnitarioNum === null ||
    precioUnitarioNum === 0 ||
    loading;

  const precioConIva =
    precioUnitarioNum != null
      ? precioUnitarioNum * (1 + (ivaNum || 0) / 100)
      : 0;

  const resetState = () => {
    setSelectedStock(null);
    setCantidad("");
    setPrecioUnitario("");
    setIva("");
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (isEditing && onEditItem) {
        const stockChanged =
          String(selectedStock?.value) !== String(editingItem!.stockId);

        // Validar duplicado si cambió el stock
        if (
          stockChanged &&
          existingStockIds.includes(Number(selectedStock?.value))
        ) {
          setError("El stock ya existe en la orden");
          setLoading(false);
          return;
        }

        const success = await onEditItem(editingItem!.id, {
          ...(stockChanged && { stockId: Number(selectedStock!.value) }),
          cantidad: cantidadNum,
          precioUnitario: precioUnitarioNum,
          iva: ivaNum,
        });
        if (success) {
          resetState();
          onClose();
        }
      } else {
        if (existingStockIds.includes(Number(selectedStock?.value))) {
          setError("El stock ya existe en la orden");
          setLoading(false);
          return;
        }

        const success = await onAddItem({
          stockId: Number(selectedStock!.value),
          cantidad: cantidadNum,
          precioUnitario: precioUnitarioNum,
          iva: ivaNum,
        });

        if (success) {
          resetState();
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || "Error al procesar el item");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      PaperProps={{ sx: { width: "450px", maxWidth: "100%" } }}
    >
      <DialogTitle>
        {isEditing ? "Editar Item" : "Agregar Nuevo Item"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Autocomplete
            options={stockOptions}
            value={selectedStock}
            onChange={(_, newValue) => setSelectedStock(newValue)}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option) => (
              <li {...props} key={option.value}>
                <Box>
                  <Typography variant="body1">{option.name}</Typography>
                  {option.label && (
                    <Typography variant="caption" color="text.secondary">
                      Rótulo: {option.label}
                    </Typography>
                  )}
                </Box>
              </li>
            )}
            filterOptions={(options, { inputValue }) => {
              const search = inputValue.toLowerCase();
              return options.filter(
                (opt) =>
                  opt.name.toLowerCase().includes(search) ||
                  opt.label.toLowerCase().includes(search),
              );
            }}
            isOptionEqualToValue={(option, value) =>
              String(option.value) === String(value.value)
            }
            renderInput={(params) => (
              <TextField {...params} label="Producto" />
            )}
            noOptionsText="No hay productos para este proveedor"
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Cantidad"
            type="number"
            fullWidth
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Precio Unitario (neto)"
            type="number"
            fullWidth
            value={precioUnitario}
            onChange={(e) => setPrecioUnitario(e.target.value)}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="IVA %"
            type="number"
            fullWidth
            value={iva}
            onChange={(e) => setIva(e.target.value)}
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
        <Button onClick={handleCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitDisabled}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Procesando..." : isEditing ? "Guardar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddItemModal;
