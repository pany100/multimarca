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
import { AusenciaProgramada } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEmpleadosContext } from "../context/EmpleadosContext";
import useVacacionPersistence from "../hooks/useVacacionPersistence";
import DeleteLicenciaModal from "./DeleteLicenciaModal";

function MecanicosLicenciasData() {
  const { empleado, loading, setRefreshTrigger } = useEmpleadosContext();
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLicencia, setSelectedLicencia] =
    useState<AusenciaProgramada | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { deleteVacacion } = useVacacionPersistence();
  const { setSnackbar } = useSnackbarContext();

  // Filter ausenciasProgramadas for licenses with tipo = "Licencia"
  const licencias =
    empleado?.ausenciasProgramadas?.filter(
      (ausencia: AusenciaProgramada) => ausencia.tipo === "Licencia"
    ) || [];

  const handleUpdate = () => {
    if (empleado?.id) {
      router.push(`/dashboard/mecanicos/${empleado.id}/agregar-licencias`);
    }
  };

  const handleEdit = (licencia: AusenciaProgramada) => {
    router.push(`/dashboard/licencias/${licencia.id}/editar`);
  };

  const handleDeleteClick = (licencia: AusenciaProgramada) => {
    setSelectedLicencia(licencia);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLicencia) return;

    setDeleteLoading(true);
    try {
      await deleteVacacion(selectedLicencia.id);

      setDeleteModalOpen(false);
      setSelectedLicencia(null);
      setRefreshTrigger((prev) => prev + 1);
      setSnackbar({
        message: "Licencia eliminada exitosamente",
        severity: "success",
        open: true,
      });
    } catch (error) {
      setSnackbar({
        message: "Error al eliminar la licencia",
        severity: "error",
        open: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedLicencia(null);
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
      field: "fechaDesde",
      headerName: "Fecha Desde",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        if (!value) return "-";
        return getFormattedDate(value as string);
      },
    },
    {
      field: "fechaHasta",
      headerName: "Fecha Hasta",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        if (!value) return "-";
        return getFormattedDate(value as string);
      },
    },
    {
      field: "esGoceSueldo",
      headerName: "Goce de Sueldo",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        return value ? "Sí" : "No";
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
      field: "fechaCreacion",
      headerName: "Fecha Creación",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        if (!value) return "-";
        return getFormattedDate(value as string);
      },
    },
    {
      field: "fechaAprobacion",
      headerName: "Fecha Aprobación",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        if (!value) return "-";
        return getFormattedDate(value as string);
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
            title="Editar licencia"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.row)}
            title="Eliminar licencia"
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

    if (!licencias || licencias.length === 0) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hay licencias registradas
          </Typography>
        </Box>
      );
    }

    return (
      <DataGrid
        rows={licencias}
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
          Licencias
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
                Agregar Licencias
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <DeleteLicenciaModal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        licencia={selectedLicencia}
        loading={deleteLoading}
      />
    </>
  );
}

export default MecanicosLicenciasData;
