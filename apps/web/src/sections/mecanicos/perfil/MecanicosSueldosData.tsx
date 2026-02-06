import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";
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
import { Sueldo } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEmpleadosContext } from "../context/EmpleadosContext";
import useSueldoPersistence from "../hooks/useSueldoPersistence";
import DeleteSueldoModal from "./DeleteSueldoModal";

function MecanicosSueldosData() {
  const { empleado, loading, setRefreshTrigger } = useEmpleadosContext();
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSueldo, setSelectedSueldo] = useState<Sueldo | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { deleteSueldo } = useSueldoPersistence();
  const { setSnackbar } = useSnackbarContext();

  const sueldos = empleado?.sueldos || [];

  const handleAdd = () => {
    if (empleado?.id) {
      router.push(`/dashboard/mecanicos/${empleado.id}/agregar-sueldos`);
    }
  };

  const handleEdit = (sueldo: Sueldo) => {
    router.push(`/dashboard/sueldos/${sueldo.id}/editar`);
  };

  const handleDeleteClick = (sueldo: Sueldo) => {
    setSelectedSueldo(sueldo);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSueldo) return;
    setDeleteLoading(true);
    try {
      await deleteSueldo(selectedSueldo.id);
      setDeleteModalOpen(false);
      setSelectedSueldo(null);
      setRefreshTrigger((prev) => prev + 1);
      setSnackbar({
        message: "Sueldo eliminado correctamente",
        severity: "success",
        open: true,
      });
    } catch (error: any) {
      setSnackbar({
        message: error?.message || "Error al eliminar el sueldo",
        severity: "error",
        open: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedSueldo(null);
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
      flex: 1,
      valueFormatter: (value) => {
        if (!value) return "-";
        return getFormattedDate(value as string);
      },
    },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      valueFormatter: (value) =>
        value != null ? getFormattedPrice(Number(value)) : "-",
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
            title="Editar sueldo"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.row)}
            title="Eliminar sueldo"
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
    if (!sueldos.length) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hay sueldos registrados
          </Typography>
        </Box>
      );
    }
    return (
      <DataGrid
        rows={sueldos}
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
          Sueldos
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
                Agregar Sueldo
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <DeleteSueldoModal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        sueldo={selectedSueldo}
        loading={deleteLoading}
      />
    </>
  );
}

export default MecanicosSueldosData;
