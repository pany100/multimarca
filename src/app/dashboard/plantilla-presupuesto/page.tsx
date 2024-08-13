"use client";
import { useFetch } from "@/contexts/FetchContext";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { forwardRef, useEffect, useState } from "react";

interface PlantillaPresupuesto {
  id: string;
  nombre: string;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const PlantillaPresupuestoPage = () => {
  const [plantillas, setPlantillas] = useState<PlantillaPresupuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [plantillaToDelete, setPlantillaToDelete] = useState<string | null>(
    null
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const router = useRouter();
  const { authFetch } = useFetch();

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "nombre", headerName: "Nombre", flex: 1 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => handleEditClick(params.row.id)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteClick(params.row.id)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  useEffect(() => {
    const fetchPlantillas = async () => {
      setLoading(true);
      try {
        const url = new URL(
          "/api/plantilla-presupuesto",
          window.location.origin
        );
        url.searchParams.append("page", paginationModel.page.toString());
        url.searchParams.append("size", paginationModel.pageSize.toString());
        if (searchTerm) url.searchParams.append("query", searchTerm);

        const response = await authFetch(url.toString());
        const data = await response.json();
        setPlantillas(data.items);
        setTotalItems(data.total);
      } catch (error) {
        console.error("Error al obtener plantillas de presupuesto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantillas();
  }, [paginationModel, authFetch, searchTerm]);

  const handleAddClick = () => {
    router.push("/dashboard/plantilla-presupuesto/nuevo");
  };

  const handleEditClick = (id: string) => {
    router.push(`/dashboard/plantilla-presupuesto/${id}/editar`);
  };

  const handleDeleteClick = (id: string) => {
    setPlantillaToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (plantillaToDelete) {
      try {
        const response = await authFetch(
          `/api/plantilla-presupuesto/${plantillaToDelete}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          setPlantillas(plantillas.filter((p) => p.id !== plantillaToDelete));
          setTotalItems(totalItems - 1);
          setSnackbar({
            open: true,
            message: "Plantilla eliminada con éxito",
            severity: "success",
          });
        } else {
          setSnackbar({
            open: true,
            message: "Error al eliminar la plantilla",
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Error al eliminar la plantilla:", error);
        setSnackbar({
          open: true,
          message: "Error al eliminar la plantilla",
          severity: "error",
        });
      }
    }
    setOpenDeleteDialog(false);
    setPlantillaToDelete(null);
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setPlantillaToDelete(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Plantillas de Presupuesto
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddClick}
        style={{ marginBottom: "1rem" }}
      >
        Agregar Plantilla
      </Button>
      <TextField
        label="Buscar"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
        margin="normal"
      />
      <DataGrid
        rows={plantillas}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50]}
        rowCount={totalItems}
        paginationMode="server"
        loading={loading}
        getRowId={(row) => row.id}
        autoHeight
      />
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirmar eliminación"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar esta plantilla de presupuesto?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlantillaPresupuestoPage;
