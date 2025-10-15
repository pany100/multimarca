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
import { LlegadaTarde } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEmpleadosContext } from "../context/EmpleadosContext";
import useLlegadaTardePersistence from "../hooks/useLlegadaTardePersistence";
import DeleteLlegadaTardeModal from "./DeleteLlegadaTardeModal";

function MecanicosLlegadasTardeData() {
  const { empleado, loading, setRefreshTrigger } = useEmpleadosContext();
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLlegadaTarde, setSelectedLlegadaTarde] =
    useState<LlegadaTarde | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { deleteLlegadaTarde } = useLlegadaTardePersistence();
  const { setSnackbar } = useSnackbarContext();

  // Get llegadas tarde from empleado
  const llegadasTarde = empleado?.llegadasTarde || [];

  const handleUpdate = () => {
    if (empleado?.id) {
      router.push(`/dashboard/mecanicos/${empleado.id}/agregar-llegadas-tarde`);
    }
  };

  const handleEdit = (llegadaTarde: LlegadaTarde) => {
    if (empleado?.id) {
      router.push(`/dashboard/llegadas-tarde/${llegadaTarde.id}/editar`);
    }
  };

  const handleDeleteClick = (llegadaTarde: LlegadaTarde) => {
    setSelectedLlegadaTarde(llegadaTarde);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLlegadaTarde) return;

    setDeleteLoading(true);
    try {
      await deleteLlegadaTarde(selectedLlegadaTarde.id);

      setDeleteModalOpen(false);
      setSelectedLlegadaTarde(null);
      setRefreshTrigger((prev) => prev + 1);
      setSnackbar({
        message: "Llegada tarde eliminada exitosamente",
        severity: "success",
        open: true,
      });
    } catch (error) {
      setSnackbar({
        message: "Error al eliminar la llegada tarde",
        severity: "error",
        open: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedLlegadaTarde(null);
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
      field: "minutosRetraso",
      headerName: "Minutos Retraso",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        return value ? `${value} min` : "-";
      },
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
      field: "estado",
      headerName: "Estado",
      flex: 1,
      align: "center",
      headerAlign: "center",
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
            title="Editar llegada tarde"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.row)}
            title="Eliminar llegada tarde"
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

    if (!llegadasTarde || llegadasTarde.length === 0) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hay llegadas tarde registradas
          </Typography>
        </Box>
      );
    }

    return (
      <DataGrid
        rows={llegadasTarde}
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
          Llegadas Tarde
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
                Agregar Llegada Tarde
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <DeleteLlegadaTardeModal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        llegadaTarde={selectedLlegadaTarde}
        loading={deleteLoading}
      />
    </>
  );
}

export default MecanicosLlegadasTardeData;
