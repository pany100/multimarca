import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { getFormattedDate } from "@/utils/fieldHelper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  CardContent,
  Grid,
  IconButton,
  Link,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Inasistencia } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEmpleadosContext } from "../context/EmpleadosContext";
import useInasistenciaPersistence from "../hooks/useInasistenciaPersistence";
import DeleteInasistenciaModal from "./DeleteInasistenciaModal";

function MecanicosInasistenciasData() {
  const { empleado, loading, setRefreshTrigger } = useEmpleadosContext();
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInasistencia, setSelectedInasistencia] =
    useState<Inasistencia | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { deleteInasistencia } = useInasistenciaPersistence();
  const { setSnackbar } = useSnackbarContext();

  // Get inasistencias from empleado
  const inasistencias = empleado?.inasistencias || [];

  const handleUpdate = () => {
    if (empleado?.id) {
      router.push(`/dashboard/mecanicos/${empleado.id}/agregar-inasistencias`);
    }
  };

  const handleEdit = (inasistencia: Inasistencia) => {
    if (empleado?.id) {
      router.push(`/dashboard/inasistencias/${inasistencia.id}/editar`);
    }
  };

  const handleDeleteClick = (inasistencia: Inasistencia) => {
    setSelectedInasistencia(inasistencia);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInasistencia) return;

    setDeleteLoading(true);
    try {
      await deleteInasistencia(selectedInasistencia.id);

      setDeleteModalOpen(false);
      setSelectedInasistencia(null);
      setRefreshTrigger((prev) => prev + 1);
      setSnackbar({
        message: "Inasistencia eliminada exitosamente",
        severity: "success",
        open: true,
      });
    } catch (error) {
      setSnackbar({
        message: "Error al eliminar la inasistencia",
        severity: "error",
        open: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedInasistencia(null);
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
      field: "tipo",
      headerName: "Tipo",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "certificadoMedicoPath",
      headerName: "Archivo",
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const ruta = params.value as string | null;
        if (!ruta) return "-";
        return (
          <Link
            href={ruta}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}
          >
            <VisibilityIcon fontSize="small" />
            Ver
          </Link>
        );
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
            title="Editar inasistencia"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.row)}
            title="Eliminar inasistencia"
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

    if (!inasistencias || inasistencias.length === 0) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hay inasistencias registradas
          </Typography>
        </Box>
      );
    }

    return (
      <DataGrid
        rows={inasistencias}
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
          Inasistencias
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
                Agregar Inasistencia
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <DeleteInasistenciaModal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        inasistencia={selectedInasistencia}
        loading={deleteLoading}
      />
    </>
  );
}

export default MecanicosInasistenciasData;
