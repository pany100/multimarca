import authFetch from "@/utils/authFetch";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Modal,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState } from "react";

interface CrudTableProps<T> {
  title: string;
  columns: GridColDef[];
  apiEndpoint: string;
  renderEditForm: (
    item: T | null,
    handleChange: (field: keyof T, value: any) => void
  ) => React.ReactNode;
  createNewItem?: () => T;
}

function CrudTable<T extends { id: string }>({
  title,
  columns,
  apiEndpoint,
  renderEditForm,
  createNewItem,
}: CrudTableProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<T | null>(null);

  const handleAddClick = () => {
    setNewItem(createNewItem ? createNewItem() : null);
    setAddModalOpen(true);
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authFetch(
        `${apiEndpoint}?page=${paginationModel.page}&size=${paginationModel.pageSize}&query=${searchTerm}`
      );
      const data = await response.json();
      setItems(Array.isArray(data) ? data : data.items || []);
      setTotalItems(
        typeof data.total === "number"
          ? data.total
          : Array.isArray(data)
          ? data.length
          : 0
      );
    } catch (error) {
      setItems([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, paginationModel.page, paginationModel.pageSize, searchTerm]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 }); // Reset to first page on new search
  };

  const handleEditClick = (id: string) => {
    const itemToEdit = items.find((item) => item.id === id);
    setEditingItem(itemToEdit || null);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem) return;

    try {
      const response = await authFetch(apiEndpoint, {
        method: "POST",
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        const createdItem = await response.json();
        setItems((prevItems) => [...prevItems, createdItem]);
        setSnackbar({
          open: true,
          message: `${title} creado con éxito`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Error al crear ${title}`,
          severity: "error",
        });
      }
    } catch (error) {
      console.error(`Error al crear ${title}:`, error);
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud de creación`,
        severity: "error",
      });
    } finally {
      setAddModalOpen(false);
      setNewItem(null);
    }
  };

  const handleNewItemChange = (field: keyof T, value: any) => {
    setNewItem((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const response = await authFetch(`${apiEndpoint}/${editingItem.id}`, {
        method: "PUT",
        body: JSON.stringify(editingItem),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          )
        );
        setSnackbar({
          open: true,
          message: `${title} actualizado con éxito`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Error al actualizar ${title}`,
          severity: "error",
        });
      }
    } catch (error) {
      console.error(`Error al actualizar ${title}:`, error);
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud de actualización`,
        severity: "error",
      });
    } finally {
      setEditModalOpen(false);
      setEditingItem(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      const response = await authFetch(`${apiEndpoint}/${itemToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemToDelete)
        );
        setSnackbar({
          open: true,
          message: `${title} eliminado con éxito`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Error al eliminar ${title}`,
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud DELETE`,
        severity: "error",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleChange = (field: keyof T, value: any) => {
    setEditingItem((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const actionColumn: GridColDef = {
    field: "acciones",
    headerName: "Acciones",
    width: 120,
    renderCell: (params) => (
      <Box>
        <IconButton onClick={() => handleEditClick(params.row.id)} size="small">
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={() => handleDeleteClick(params.row.id)}
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    ),
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      {createNewItem && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Agregar {title}
        </Button>
      )}
      <TextField
        label="Buscar"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
        margin="normal"
      />
      {loading && <CircularProgress />}
      {!loading && items.length === 0 ? (
        <Typography>No hay datos para mostrar</Typography>
      ) : (
        <DataGrid
          rows={items}
          columns={[...columns, actionColumn]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 30]}
          rowCount={totalItems}
          paginationMode="server"
          filterMode="server"
          loading={loading}
          getRowId={(row) => row.id}
        />
      )}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Editar {title}
          </Typography>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2 }}>
            {renderEditForm(editingItem, handleChange)}
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Guardar cambios
            </Button>
          </Box>
        </Box>
      </Modal>
      {createNewItem && (
        <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" component="h2">
              Agregar nuevo {title}
            </Typography>
            <Box component="form" onSubmit={handleAddSubmit} sx={{ mt: 2 }}>
              {renderEditForm(newItem, handleNewItemChange)}
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Crear
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <Typography>
          ¿Estás seguro de que quieres eliminar este {title}?
        </Typography>
        <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
        <Button onClick={handleDeleteConfirm} autoFocus>
          Eliminar
        </Button>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CrudTable;
