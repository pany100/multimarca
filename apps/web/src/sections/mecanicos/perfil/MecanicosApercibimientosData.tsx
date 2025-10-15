import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { getFormattedDate } from "@/utils/fieldHelper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  CardContent,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Apercibimiento } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEmpleadosContext } from "../context/EmpleadosContext";
import useApercibimientoPersistence from "../hooks/useApercibimientoPersistence";
import DeleteApercibimientoModal from "./DeleteApercibimientoModal";

function MecanicosApercibimientosData() {
  const { empleado, loading, setRefreshTrigger } = useEmpleadosContext();
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedApercibimiento, setSelectedApercibimiento] =
    useState<Apercibimiento | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { deleteApercibimiento } = useApercibimientoPersistence();
  const { setSnackbar } = useSnackbarContext();

  // Get apercibimientos from empleado
  const apercibimientos = empleado?.apercibimientos || [];

  const handleUpdate = () => {
    if (empleado?.id) {
      router.push(`/dashboard/mecanicos/${empleado.id}/agregar-apercibimientos`);
    }
  };

  const handleEdit = (apercibimiento: Apercibimiento) => {
    if (empleado?.id) {
      router.push(`/dashboard/apercibimientos/${apercibimiento.id}/editar`);
    }
  };

  const handleDeleteClick = (apercibimiento: Apercibimiento) => {
    setSelectedApercibimiento(apercibimiento);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedApercibimiento) return;

    setDeleteLoading(true);
    try {
      await deleteApercibimiento(selectedApercibimiento.id);

      setDeleteModalOpen(false);
      setSelectedApercibimiento(null);
      setRefreshTrigger((prev) => prev + 1);
      setSnackbar({
        message: "Apercibimiento eliminado exitosamente",
        severity: "success",
        open: true,
      });
    } catch (error) {
      setSnackbar({
        message: "Error al eliminar el apercibimiento",
        severity: "error",
        open: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedApercibimiento(null);
  };

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.5,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        if (!value) return "-";
        return getFormattedDate(value as string);
      },
    },
    {
      field: "tipo",
      headerName: "Tipo",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "motivo",
      headerName: "Motivo",
      flex: 2,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        return value || "-";
      },
    },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
            title="Editar apercibimiento"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.row)}
            title="Eliminar apercibimiento"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const renderTableContent = () => {
    if (loading) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1">Cargando datos...</Typography>
        </Box>
      );
    }

    if (!apercibimientos || apercibimientos.length === 0) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hay apercibimientos registrados
          </Typography>
        </Box>
      );
    }

    return (
      <DataGrid
        rows={apercibimientos}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          "& .MuiDataGrid-cell": {
            fontSize: "0.875rem",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          "& .MuiDataGrid-columnHeader": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          backgroundColor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
        }}
      />
    );
  };

  return (
    <>
      <Box sx={{ bgcolor: "primary.main", color: "white", p: 1.5, mt: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Apercibimientos
        </Typography>
      </Box>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {renderTableContent()}
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleUpdate}
                disabled={!empleado?.id}
              >
                Agregar Apercibimiento
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <DeleteApercibimientoModal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        apercibimiento={selectedApercibimiento}
        loading={deleteLoading}
      />
    </>
  );
}

export default MecanicosApercibimientosData;
