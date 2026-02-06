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
import { NotaAdministrativa } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEmpleadosContext } from "../context/EmpleadosContext";
import useNotaAdministrativaPersistence from "../hooks/useNotaAdministrativaPersistence";
import DeleteNotaAdministrativaModal from "./DeleteNotaAdministrativaModal";

function MecanicosNotasAdministrativasData() {
  const { empleado, loading, setRefreshTrigger } = useEmpleadosContext();
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<NotaAdministrativa | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { deleteNotaAdministrativa } = useNotaAdministrativaPersistence();
  const { setSnackbar } = useSnackbarContext();

  const notas = empleado?.notasAdministrativas || [];

  const handleAdd = () => {
    if (empleado?.id) {
      router.push(
        `/dashboard/mecanicos/${empleado.id}/agregar-notas-administrativas`
      );
    }
  };

  const handleEdit = (nota: NotaAdministrativa) => {
    router.push(`/dashboard/notas-administrativas/${nota.id}/editar`);
  };

  const handleDeleteClick = (nota: NotaAdministrativa) => {
    setSelectedNota(nota);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNota) return;
    setDeleteLoading(true);
    try {
      await deleteNotaAdministrativa(selectedNota.id);
      setDeleteModalOpen(false);
      setSelectedNota(null);
      setRefreshTrigger((prev) => prev + 1);
      setSnackbar({
        message: "Nota administrativa eliminada correctamente",
        severity: "success",
        open: true,
      });
    } catch (error: any) {
      setSnackbar({
        message: error?.message || "Error al eliminar la nota",
        severity: "error",
        open: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedNota(null);
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.4,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 0.8,
      valueFormatter: (value) => {
        if (!value) return "-";
        return getFormattedDate(value as string);
      },
    },
    {
      field: "titulo",
      headerName: "Título",
      flex: 1.2,
      valueFormatter: (value) => value ?? "-",
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 2,
      valueFormatter: (value) => {
        const str = value as string;
        if (!str) return "-";
        return str.length > 60 ? `${str.slice(0, 60)}...` : str;
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
            title="Editar nota"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.row)}
            title="Eliminar nota"
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
    if (!notas.length) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hay notas administrativas registradas
          </Typography>
        </Box>
      );
    }
    return (
      <DataGrid
        rows={notas}
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
          },
          "& .MuiDataGrid-columnHeader": {
            display: "flex",
            alignItems: "center",
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
          Notas Administrativas
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
                onClick={handleAdd}
                disabled={!empleado?.id}
              >
                Agregar Nota
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <DeleteNotaAdministrativaModal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        nota={selectedNota}
        loading={deleteLoading}
      />
    </>
  );
}

export default MecanicosNotasAdministrativasData;
