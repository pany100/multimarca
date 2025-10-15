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
import { HoraExtra } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEmpleadosContext } from "../context/EmpleadosContext";
import useHoraExtraPersistence from "../hooks/useHoraExtraPersistence";
import DeleteHoraExtraModal from "./DeleteHoraExtraModal";

function MecanicosHorasExtrasData() {
  const { empleado, loading, setRefreshTrigger } = useEmpleadosContext();
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedHoraExtra, setSelectedHoraExtra] =
    useState<HoraExtra | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { deleteHoraExtra } = useHoraExtraPersistence();
  const { setSnackbar } = useSnackbarContext();

  // Get horas extras from empleado
  const horasExtras = empleado?.horasExtra || [];

  const handleUpdate = () => {
    if (empleado?.id) {
      router.push(`/dashboard/mecanicos/${empleado.id}/agregar-horas-extras`);
    }
  };

  const handleEdit = (horaExtra: HoraExtra) => {
    if (empleado?.id) {
      router.push(`/dashboard/horas-extras/${horaExtra.id}/editar`);
    }
  };

  const handleDeleteClick = (horaExtra: HoraExtra) => {
    setSelectedHoraExtra(horaExtra);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedHoraExtra) return;

    setDeleteLoading(true);
    try {
      await deleteHoraExtra(selectedHoraExtra.id);

      setDeleteModalOpen(false);
      setSelectedHoraExtra(null);
      setRefreshTrigger((prev) => prev + 1);
      setSnackbar({
        message: "Hora extra eliminada exitosamente",
        severity: "success",
        open: true,
      });
    } catch (error) {
      setSnackbar({
        message: "Error al eliminar la hora extra",
        severity: "error",
        open: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedHoraExtra(null);
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
      field: "horasTotales",
      headerName: "Horas Totales",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        return value ? `${value} hs` : "-";
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
            title="Editar hora extra"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.row)}
            title="Eliminar hora extra"
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

    if (!horasExtras || horasExtras.length === 0) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hay horas extras registradas
          </Typography>
        </Box>
      );
    }

    return (
      <DataGrid
        rows={horasExtras}
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
          Horas Extras
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
                Agregar Hora Extra
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <DeleteHoraExtraModal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        horaExtra={selectedHoraExtra}
        loading={deleteLoading}
      />
    </>
  );
}

export default MecanicosHorasExtrasData;
