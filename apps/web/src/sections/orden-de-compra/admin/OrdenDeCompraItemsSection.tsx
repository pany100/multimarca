"use client";

import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useOrdenDeCompraItemsManager } from "../hooks/useOrdenDeCompraItemsManager";
import AddItemModal from "./AddItemModal";
import { useOrdenDeCompraContext } from "./contexts/OrdenDeCompraContext";

interface EditingItem {
  id: number;
  stockId: number;
  stockName: string;
  cantidad: number;
  precioUnitario: number | null;
  iva: number | null;
}

const OrdenDeCompraItemsSection = () => {
  const { orden } = useOrdenDeCompraContext();
  const { addItem, deleteItem, updateItem, loading } =
    useOrdenDeCompraItemsManager();
  const { setSnackbar } = useSnackbarContext();
  const [openModal, setOpenModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

  const items = orden.items || [];
  const existingStockIds = items.map((item: any) => item.stockId);

  const precioTotalRaw = items.reduce((total: number, item: any) => {
    const precio = Number(item.precioUnitario) || 0;
    const iva = Number(item.iva) || 0;
    return total + precio * (1 + iva / 100) * Number(item.cantidad);
  }, 0);
  const precioTotal = Math.round(precioTotalRaw * 100) / 100;

  const handleAddItem = async (data: {
    stockId: number;
    cantidad: number;
    precioUnitario: number | null;
    iva: number | null;
  }) => {
    try {
      await addItem(data);
      setSnackbar({
        open: true,
        message: "Item agregado correctamente",
        severity: "success",
      });
      return true;
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Error al agregar el item",
        severity: "error",
      });
      throw err;
    }
  };

  const handleEditItem = async (
    itemId: number,
    data: {
      stockId?: number;
      cantidad: number;
      precioUnitario: number | null;
      iva: number | null;
    },
  ) => {
    try {
      await updateItem(itemId, data);
      setSnackbar({
        open: true,
        message: "Item actualizado correctamente",
        severity: "success",
      });
      return true;
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Error al actualizar el item",
        severity: "error",
      });
      throw err;
    }
  };

  const handleDeleteItem = async () => {
    if (deleteItemId === null) return;
    try {
      await deleteItem(deleteItemId);
      setSnackbar({
        open: true,
        message: "Item eliminado correctamente",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Error al eliminar el item",
        severity: "error",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem({
      id: item.id,
      stockId: item.stockId,
      stockName: item.name || item.stock?.name || "",
      cantidad: item.cantidad,
      precioUnitario:
        item.precioUnitario != null ? Number(item.precioUnitario) : null,
      iva: item.iva != null ? Number(item.iva) : null,
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingItem(null);
  };

  const columns: GridColDef[] = [
    {
      field: "producto",
      headerName: "Producto",
      flex: 2,
      renderCell: (params) =>
        params.row.name || params.row.stock?.name || "—",
    },
    {
      field: "label",
      headerName: "Rótulo",
      flex: 1,
      renderCell: (params) =>
        params.row.label || params.row.stock?.label || "—",
    },
    {
      field: "cantidad",
      headerName: "Cantidad",
      flex: 0.6,
    },
    {
      field: "precioUnitario",
      headerName: "P. Unitario",
      flex: 0.8,
      renderCell: (params) =>
        params.row.precioUnitario != null
          ? getFormattedPrice(Number(params.row.precioUnitario))
          : "—",
    },
    {
      field: "iva",
      headerName: "IVA %",
      flex: 0.5,
      renderCell: (params) =>
        params.row.iva != null ? `${Number(params.row.iva)}%` : "—",
    },
    {
      field: "precioConIva",
      headerName: "P. c/IVA",
      flex: 0.8,
      renderCell: (params) => {
        const precio = Number(params.row.precioUnitario) || 0;
        const iva = Number(params.row.iva) || 0;
        return params.row.precioUnitario != null
          ? getFormattedPrice(precio * (1 + iva / 100))
          : "—";
      },
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      flex: 0.8,
      renderCell: (params) => {
        const precio = Number(params.row.precioUnitario) || 0;
        const iva = Number(params.row.iva) || 0;
        const subtotal = precio * (1 + iva / 100) * Number(params.row.cantidad);
        return params.row.precioUnitario != null ? (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {getFormattedPrice(subtotal)}
          </Typography>
        ) : (
          "—"
        );
      },
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenEdit(params.row)}
            disabled={loading}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setDeleteItemId(params.row.id)}
            disabled={loading}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            Items de la Orden
          </Typography>

          {loading && items.length === 0 ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : items.length > 0 ? (
            <Box sx={{ width: "100%" }}>
              <DataGrid
                rows={items}
                columns={columns}
                disableRowSelectionOnClick
                hideFooter
                sx={{
                  border: 1,
                  borderColor: "divider",
                  "& .MuiDataGrid-columnHeader": {
                    backgroundColor: "primary.light",
                    color: "white",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  },
                  "& .MuiDataGrid-filler": {
                    backgroundColor: "primary.light",
                  },
                  "& .MuiDataGrid-cell": {
                    display: "flex",
                    alignItems: "center",
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                  },
                  "& .MuiDataGrid-row": {
                    maxHeight: "none !important",
                  },
                }}
                getRowHeight={() => "auto"}
              />
            </Box>
          ) : (
            <Box p={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                No hay items en esta orden de compra
              </Typography>
            </Box>
          )}

          {/* Footer con total */}
          {items.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
                pr: 1,
              }}
            >
              <Paper
                sx={{
                  px: 3,
                  py: 1.5,
                  backgroundColor: "primary.lighter",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                }}
                elevation={0}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  Total de Items:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {getFormattedPrice(precioTotal)}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Botón agregar */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingItem(null);
                setOpenModal(true);
              }}
              disabled={loading}
            >
              Agregar Item
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Modal para agregar/editar item */}
      <AddItemModal
        open={openModal}
        onClose={handleCloseModal}
        proveedorId={orden.proveedorId}
        existingStockIds={
          editingItem
            ? existingStockIds.filter((id: number) => id !== editingItem.stockId)
            : existingStockIds
        }
        onAddItem={handleAddItem}
        onEditItem={handleEditItem}
        editingItem={editingItem}
      />

      {/* Confirmación de eliminación */}
      <Dialog
        open={deleteItemId !== null}
        onClose={() => setDeleteItemId(null)}
      >
        <DialogTitle>Eliminar Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este item? Se restaurará el stock
            correspondiente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteItemId(null)}>Cancelar</Button>
          <Button
            onClick={handleDeleteItem}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrdenDeCompraItemsSection;
