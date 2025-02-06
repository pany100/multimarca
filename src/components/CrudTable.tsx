import { useFetch } from "@/contexts/FetchContext";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState } from "react";
import * as yup from "yup";
import DynamicForm, { FieldConfig } from "./DynamicForm";

interface CrudTableProps<T> {
  title: string;
  columns: GridColDef[];
  apiEndpoint: string;
  fields: FieldConfig[];
  createNewItem?: () => T;
  extraActions?: (item: T) => React.ReactNode;
  getRowClassName?: (params: GridRowParams) => string;
  refreshTrigger?: number;
  validationSchema: yup.ObjectSchema<any>;
  nonEditableItems?: number[];
  shouldRenderEdit?: (item: T) => boolean;
  shouldRenderDelete?: (item: T) => boolean;
  onEdit?: (item: T | undefined) => void;
}

function CrudTable<T extends { id: string }>({
  title,
  columns,
  apiEndpoint,
  createNewItem,
  extraActions,
  getRowClassName,
  refreshTrigger = 0,
  fields,
  validationSchema,
  nonEditableItems = [],
  shouldRenderEdit,
  shouldRenderDelete,
  onEdit,
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
  const { authFetch } = useFetch();

  const handleAddClick = () => {
    setNewItem(createNewItem ? createNewItem() : null);
    setAddModalOpen(true);
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(apiEndpoint, window.location.origin);
      url.searchParams.append("page", paginationModel.page.toString());
      url.searchParams.append("size", paginationModel.pageSize.toString());
      if (searchTerm) url.searchParams.append("query", searchTerm);

      const response = await authFetch(url.toString());
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
  }, [
    apiEndpoint,
    paginationModel.page,
    paginationModel.pageSize,
    authFetch,
    searchTerm,
  ]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, refreshTrigger]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 }); // Reset to first page on new search
  };

  const handleEditClick = (id: string) => {
    const itemToEdit = items.find((item) => item.id === id);
    onEdit?.(itemToEdit);
    setEditingItem(itemToEdit || null);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleAddSubmit = async (data: T) => {
    try {
      const url = new URL(apiEndpoint, window.location.origin);
      const baseUrl = `${url.origin}${url.pathname}`;

      const response = await authFetch(baseUrl, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const createdItem = await response.json();
        setItems((prevItems) => [createdItem, ...prevItems]);
        setSnackbar({
          open: true,
          message: `${title} creado con éxito`,
          severity: "success",
        });
      } else {
        const errorMessage = await response.json();
        setSnackbar({
          open: true,
          message: `Error al crear ${title}: ${errorMessage.error}`,
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

  const handleEditSubmit = async (data: T) => {
    try {
      const url = new URL(apiEndpoint, window.location.origin);
      const baseUrl = `${url.origin}${url.pathname}`;

      const response = await authFetch(`${baseUrl}/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
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
        const errorMessage = await response.json();
        setSnackbar({
          open: true,
          message: `Error al actualizar ${title}: ${errorMessage.error}`,
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
      const url = new URL(apiEndpoint, window.location.origin);
      const baseUrl = `${url.origin}${url.pathname}`;

      const response = await authFetch(`${baseUrl}/${itemToDelete}`, {
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
    width: 150,
    renderCell: (params) => {
      const showEdit = shouldRenderEdit ? shouldRenderEdit(params.row) : true;
      const showDelete = shouldRenderDelete
        ? shouldRenderDelete(params.row)
        : true;

      if (nonEditableItems.includes(params.row.id)) {
        return null;
      }
      return (
        <Box>
          {showEdit && (
            <IconButton
              onClick={() => handleEditClick(params.row.id)}
              size="small"
            >
              <EditIcon />
            </IconButton>
          )}
          {showDelete && (
            <IconButton
              onClick={() => handleDeleteClick(params.row.id)}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          )}
          {extraActions && extraActions(params.row)}
        </Box>
      );
    },
  };

  return (
    <Box sx={{ width: "100%", p: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <TextField
            placeholder="Buscar..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <Box component="span" sx={{ color: "text.secondary", mr: 1 }}>
                  🔍
                </Box>
              ),
            }}
          />

          {createNewItem && (
            <Button
              variant="contained"
              onClick={handleAddClick}
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: (theme) => theme.palette.primary.main,
                color: "white",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
                px: 3,
                py: 1,
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              AGREGAR {title.toUpperCase()}
            </Button>
          )}
        </Box>
      </Box>

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
          getRowClassName={getRowClassName}
          getRowHeight={() => "auto"}
          sx={{
            border: 1,
            borderColor: "divider",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: (theme) => theme.palette.primary.main,
              fontSize: "0.875rem",
              fontWeight: 600,
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              minHeight: "50px",
              fontSize: "0.875rem",
            },
            "& .MuiDataGrid-row": {
              minHeight: "50px !important", // Asegura la altura mínima para la fila
              "&:hover": {
                backgroundColor: "action.hover",
              },
            },
          }}
        />
      )}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            boxShadow: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Editar
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <DynamicForm<T>
            item={editingItem}
            fields={fields}
            handleChange={handleChange}
            onSubmit={handleEditSubmit}
            validationSchema={validationSchema}
            cancel={() => setEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      {createNewItem && (
        <Dialog
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 1,
              boxShadow: 3,
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 2,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Agregar Nuevo
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 3 }}>
            <DynamicForm<T>
              item={newItem}
              fields={fields}
              handleChange={handleNewItemChange}
              onSubmit={handleAddSubmit}
              validationSchema={validationSchema}
              cancel={() => setAddModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar este {title}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2, px: 3 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
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
