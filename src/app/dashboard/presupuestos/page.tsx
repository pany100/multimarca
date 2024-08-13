"use client";
import { useFetch } from "@/contexts/FetchContext";
import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { EstadoOrdenReparacion } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OrdenReparacion {
  id: string;
  fecha: string;
  status: string;
  auto: {
    patent: string;
    owner: {
      fullName: string;
    };
  };
}

const OrdenesReparacionPage = () => {
  const [ordenes, setOrdenes] = useState<OrdenReparacion[]>([]);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { authFetch } = useFetch();
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.3 },
    {
      field: "fechaEntradaReparacion",
      headerName: "Fecha Entrada a Taller",
      flex: 1,
      valueGetter: (fechaEntradaReparacion: string) => {
        return fechaEntradaReparacion
          ? new Date(fechaEntradaReparacion).toLocaleDateString("es-AR")
          : "No ingresado";
      },
    },
    {
      field: "vehículo",
      headerName: "Auto",
      flex: 2,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {params.row.auto.brand} {params.row.auto.model}
          </Typography>
          <Typography>{params.row.auto.patent}</Typography>
        </Box>
      ),
    },
    {
      field: "estado",
      headerName: "Estado",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={
            estadosDisplay[params.value as EstadoOrdenReparacion] ||
            params.value
          }
          sx={{
            backgroundColor:
              estadoColors[params.value as EstadoOrdenReparacion] ||
              "transparent",
            color: "white",
            fontWeight: "bold",
          }}
        />
      ),
    },
    {
      field: "cliente",
      headerName: "Cliente",
      flex: 1,
      renderCell: (params: any) => params.row.auto.owner.fullName,
    },
    {
      field: "totalAPagar",
      headerName: "Total a Pagar",
      flex: 1,
      renderCell: (params: any) =>
        calcularTotalOrdenReparacion(params.row).toFixed(2),
    },
    {
      field: "totalPagado",
      headerName: "Total Pagado",
      flex: 1,
      renderCell: (params: any) =>
        params.row.ingresos
          .reduce((sum: number, ingreso: any) => sum + Number(ingreso.monto), 0)
          .toFixed(2),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 200,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => handleEditClick(params.row.id)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() =>
              router.push(`/dashboard/ordenes-reparacion/${params.row.id}/ver`)
            }
            size="small"
          >
            <VisibilityIcon />
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
  const estadosDisplay: Record<EstadoOrdenReparacion, string> = {
    [EstadoOrdenReparacion.Presupuestado]: "Presupuestado",
    [EstadoOrdenReparacion.Aceptado]: "Aceptado",
    [EstadoOrdenReparacion.EnProgreso]: "En Progreso",
    [EstadoOrdenReparacion.Terminado]: "Terminado",
  };
  const estadoColors = {
    [EstadoOrdenReparacion.Presupuestado]: "#FFA500",
    [EstadoOrdenReparacion.Aceptado]: "#FFD700",
    [EstadoOrdenReparacion.EnProgreso]: "#4169E1",
    [EstadoOrdenReparacion.Terminado]: "#32CD32",
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      const url = new URL("/api/orden-reparacion", window.location.origin);
      const baseUrl = `${url.origin}${url.pathname}`;

      const response = await authFetch(`${baseUrl}/${itemToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setOrdenes((prevItems) =>
          prevItems.filter((item) => item.id !== itemToDelete)
        );
        setSnackbar({
          open: true,
          message: `Orden de reparación eliminada con éxito`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Error al eliminar la orden de reparación`,
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

  useEffect(() => {
    const fetchOrdenes = async () => {
      setLoading(true);
      try {
        const url = new URL("/api/orden-reparacion", window.location.origin);
        url.searchParams.append("page", paginationModel.page.toString());
        url.searchParams.append("size", paginationModel.pageSize.toString());
        if (searchTerm) url.searchParams.append("query", searchTerm);
        url.searchParams.append("estado", EstadoOrdenReparacion.Presupuestado);

        const response = await authFetch(url.toString());
        const data = await response.json();
        setOrdenes(data.items);
        setTotalItems(data.total);
      } catch (error) {
        console.error("Error al obtener órdenes de reparación:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenes();
  }, [paginationModel, authFetch, searchTerm]);

  const handleAddClick = () => {
    setAddModalOpen(true);
  };

  const handleAddTemplateBlank = () => {
    router.push("/dashboard/presupuestos/nuevo");
    setAddModalOpen(false);
  };

  const handleEditClick = (id: string) => {
    router.push(`/dashboard/ordenes-reparacion/${id}/editar`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Presupuestos
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddClick}
        style={{ marginBottom: "1rem" }}
      >
        Agregar Presupuesto
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
        rows={ordenes}
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
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar este presupuesto?
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
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <DialogTitle>Agregar Presupuesto</DialogTitle>
        <DialogContent>
          <Typography>
            Seleccione una opción para agregar un nuevo presupuesto:
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2, px: 3 }}>
          <Button
            onClick={() => setAddModalOpen(false)}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddTemplateBlank}
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
          >
            Agregar Template en Blanco
          </Button>
          <Button
            onClick={() => {
              // Aquí iría la lógica para "Aceptar"
              setAddModalOpen(false);
            }}
            variant="contained"
            color="success"
          >
            Aceptar
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
};

export default OrdenesReparacionPage;
